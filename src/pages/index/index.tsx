import Taro, { Component, Config } from "@tarojs/taro";
import { View, Button } from "@tarojs/components";

import Card from "../../palette/card";
import Poster from "../../component/poster/index";
import "./index.scss";

interface IProps {}
interface IState {
  imagePath: string;
  template: object;
}

export default class Index extends Component<IProps, IState> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: "painter demo"
  };
  state: IState = {
    template: new Card().palette(),
    imagePath: ""
  };
  // 图片生成成功回调
  onImgOK = e => {
    this.setState({
      imagePath: e.path
    });
  };
  // 图片生成失败回调
  onImgErr = error => {
    console.log(
      "%cerror: ",
      "color: MidnightBlue; background: Aquamarine; font-size: 20px;",
      error
    );
  };
  painterRef: Poster | null;

  // 保存图片到本地相册
  saveImage() {
    this.painterRef && this.painterRef.saveImage()
  }

  componentWillMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return (
      <View className="index">
        <Poster
          customStyle="margin-left:40rpx"
          palette={this.state.template}
          onImgOK={this.onImgOK}
          onImgErr={this.onImgErr}
          ref={node => this.painterRef = node}
        />
        <Button className="save-button" onClick={this.saveImage}>
          保存
        </Button>
      </View>
    );
  }
}
