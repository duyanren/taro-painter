import Taro, { Component } from "@tarojs/taro";
import { Canvas } from "@tarojs/components";

import Pen from "./lib/pen";
import Downloader from "./lib/downloader";
import { getAuthSetting, saveImageToPhotosAlbum, equal } from "./lib/util";
const downloader = new Downloader();

// 最大尝试的绘制次数
const MAX_PAINT_COUNT = 5;

interface IProps {
  customStyle: string; // canvas自定义样式
  palette: object; // painter模板
  widthPixels: number; // 像素宽度
  dirty: boolean; // 启用脏检查，默认 false
  onImgErr: Function; // 图片失败回调
  onImgOK: Function; // 图片成功回调
}

interface IState {
  painterStyle: string; // canvas 宽度+高度样式
}

export default class QyPoster extends Component<IProps, IState> {
  static defaultProps = {
    customStyle: "",
    palette: {},
    widthPixels: 0,
    dirty: false,
    onImgErr: () => null,
    onImgOK: () => null
  };

  canvasId: string = "k-canvas"; // canvas-id

  filePath: string = ''; // 生成的文件路径

  state: IState = {
    painterStyle: ""
  };

  canvasWidthInPx: number = 0; // width to px
  canvasHeightInPx: number = 0; // height to px
  paintCount: number = 0; // 绘制次数
  /**
   * 判断一个 object 是否为空
   * @param {object} object
   */
  isEmpty(object) {
    for (const _i in object) {
      return false;
    }
    return true;
  }

  isNeedRefresh = (newVal, oldVal) => {
    if (
      !newVal ||
      this.isEmpty(newVal) ||
      (this.props.dirty && equal(newVal, oldVal))
    ) {
      return false;
    }
    return true;
  };

  setStringPrototype = (screenK, scale) => {
    /**
     * 是否支持负数
     * @param {Boolean} minus 是否支持负数
     */
    //@ts-ignore
    String.prototype.toPx = function toPx(minus) {
      let reg;
      if (minus) {
        reg = /^-?[0-9]+([.]{1}[0-9]+){0,1}(rpx|px)$/g;
      } else {
        reg = /^[0-9]+([.]{1}[0-9]+){0,1}(rpx|px)$/g;
      }
      const results = reg.exec(this);
      if (!this || !results) {
        console.error(`The size: ${this} is illegal`);
        return 0;
      }
      const unit = results[2];
      const value = parseFloat(this);

      let res = 0;
      if (unit === "rpx") {
        res = Math.round(value * screenK * (scale || 1));
      } else if (unit === "px") {
        res = Math.round(value * (scale || 1));
      }
      return res;
    };
  };
  // 执行绘制
  startPaint = () => {
    // 如果palette模板为空 则return
    if (this.isEmpty(this.props.palette)) {
      return;
    }

    if (!(Taro.getApp().systemInfo && Taro.getApp().systemInfo.screenWidth)) {
      try {
        Taro.getApp().systemInfo = Taro.getSystemInfoSync();
      } catch (e) {
        const error = `Painter get system info failed, ${JSON.stringify(e)}`;
        console.error(error);
        this.props.onImgErr && this.props.onImgErr(error);
        return;
      }
    }
    let screenK = Taro.getApp().systemInfo.screenWidth / 750;
    this.setStringPrototype(screenK, 1);

    this.downloadImages().then((palette: any) => {
      const { width, height } = palette;

      if (!width || !height) {
        console.error(
          `You should set width and height correctly for painter, width: ${width}, height: ${height}`
        );
        return;
      }
      this.canvasWidthInPx = width.toPx();
      if (this.props.widthPixels) {
        // 如果重新设置过像素宽度，则重新设置比例
        this.setStringPrototype(
          screenK,
          this.props.widthPixels / this.canvasWidthInPx
        );
        this.canvasWidthInPx = this.props.widthPixels;
      }

      this.canvasHeightInPx = height.toPx();
      this.setState({
        painterStyle: `width:${this.canvasWidthInPx}px;height:${this.canvasHeightInPx}px;`
      });
      const ctx = Taro.createCanvasContext(this.canvasId, this.$scope);
      const pen = new Pen(ctx, palette);
      pen.paint(() => {
        this.saveImgToLocal();
      });
    });
  };

  // 下载图片
  downloadImages = () => {
    return new Promise(resolve => {
      let preCount = 0;
      let completeCount = 0;
      const paletteCopy = JSON.parse(JSON.stringify(this.props.palette));
      if (paletteCopy.background) {
        preCount++;
        downloader.download(paletteCopy.background).then(
          path => {
            paletteCopy.background = path;
            completeCount++;
            if (preCount === completeCount) {
              resolve(paletteCopy);
            }
          },
          () => {
            completeCount++;
            if (preCount === completeCount) {
              resolve(paletteCopy);
            }
          }
        );
      }
      if (paletteCopy.views) {
        for (const view of paletteCopy.views) {
          if (view && view.type === "image" && view.url) {
            preCount++;
            downloader.download(view.url).then(
              path => {
                view.url = path;
                Taro.getImageInfo({
                  src: view.url,
                  //@ts-ignore
                  success: res => {
                    // 获得一下图片信息，供后续裁减使用
                    view.sWidth = res.width;
                    view.sHeight = res.height;
                  },
                  fail: error => {
                    // 如果图片坏了，则直接置空，防止坑爹的 canvas 画崩溃了
                    view.url = "";
                    console.error(
                      `getImageInfo ${view.url} failed, ${JSON.stringify(
                        error
                      )}`
                    );
                  },
                  complete: () => {
                    completeCount++;
                    if (preCount === completeCount) {
                      resolve(paletteCopy);
                    }
                  }
                });
              },
              () => {
                completeCount++;
                if (preCount === completeCount) {
                  resolve(paletteCopy);
                }
              }
            );
          }
        }
      }
      if (preCount === 0) {
        resolve(paletteCopy);
      }
    });
  };

  // 保存图片到本地
  saveImgToLocal = () => {
    setTimeout(() => {
      Taro.canvasToTempFilePath(
        {
          canvasId: this.canvasId,
          success: res => {
            this.getImageInfo(res.tempFilePath);
          },
          fail: error => {
            console.error(
              `canvasToTempFilePath failed, ${JSON.stringify(error)}`
            );
            this.props.onImgErr && this.props.onImgErr(error);
          }
        },
        this.$scope
      );
    }, 300);
  };

  getImageInfo = filePath => {
    Taro.getImageInfo({
      src: filePath,
      //@ts-ignore
      success: infoRes => {
        if (this.paintCount > MAX_PAINT_COUNT) {
          const error = `The result is always fault, even we tried ${MAX_PAINT_COUNT} times`;
          console.error(error);
          this.props.onImgErr && this.props.onImgErr(error);
          return;
        }
        // 比例相符时才证明绘制成功，否则进行强制重绘制
        if (
          Math.abs(
            (infoRes.width * this.canvasHeightInPx -
              this.canvasWidthInPx * infoRes.height) /
              (infoRes.height * this.canvasHeightInPx)
          ) < 0.01
        ) {
          this.filePath = filePath;
          this.props.onImgOK && this.props.onImgOK({ path: filePath });
        } else {
          this.startPaint();
        }
        this.paintCount++;
      },
      fail: error => {
        console.error(`getImageInfo failed, ${JSON.stringify(error)}`);
        this.props.onImgErr && this.props.onImgErr(error);
      }
    });
  };

  // 保存海报到手机相册
  saveImage() {
    const scope = "scope.writePhotosAlbum";
    getAuthSetting(scope).then((res: boolean) => {
      if (res) {
        // 授权过 直接保存
        this.saveImageToPhotos();
        return false;
      }
      // 未授权过 先获取权限
      getAuthSetting(scope).then((status: boolean) => {
        if (status) {
          // 获取保存图片到相册权限成功
          this.saveImageToPhotos();
          return false;
        }
        // 用户拒绝授权后的回调 获取权限失败
        Taro.showModal({
          title: "提示",
          content: "若不打开授权，则无法将图片保存在相册中！",
          showCancel: true,
          cancelText: "暂不授权",
          cancelColor: "#000000",
          confirmText: "去授权",
          confirmColor: "#3CC51F",
          success: function(res) {
            if (res.confirm) {
              // 用户点击去授权
              Taro.openSetting({
                //调起客户端小程序设置界面，返回用户设置的操作结果。
              });
            } else {
              //
            }
          }
        });
      });
    });
  }
  saveImageToPhotos = () => {
    saveImageToPhotosAlbum(this.filePath)
      .then(() => {
        // 成功保存图片到本地相册
        // 保存失败
        Taro.showToast({
          title: "保存成功",
          icon: "none"
        });
      })
      .catch(() => {
        // 保存失败
        Taro.showToast({
          title: "保存失败",
          icon: "none"
        });
      });
  };

  componentWillMount() {
    this.startPaint();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.palette !== this.props.palette) {
      this.paintCount = 0;
      this.startPaint();
    }
  }

  render() {
    return (
      <Canvas
        canvasId={this.canvasId}
        style={`${this.state.painterStyle}${this.props.customStyle}`}
      />
    );
  }
}
