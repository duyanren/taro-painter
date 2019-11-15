import Taro, { Component, Config } from "@tarojs/taro";
import { View, Button } from "@tarojs/components";

import Card from "../../palette/card";
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
    navigationBarTitleText: "首页",
    usingComponents: {
      painter: "../../component/painter/painter"
    }
  };
  state: IState = {
    template: {},
    imagePath: ""
  };
  onImgOK(e) {
    const imagePath = e.detail.path;
    this.setState({
      imagePath
    });
    console.log(
      "%cimagePath: ",
      "color: MidnightBlue; background: Aquamarine; font-size: 20px;",
      imagePath
    );
  }

  saveImage() {
    Taro.saveImageToPhotosAlbum({
      filePath: this.state.imagePath
    });
  }

  componentWillMount() {}

  componentDidMount() {
    console.log(
      "%cnew Card().palette(): ",
      "color: MidnightBlue; background: Aquamarine; font-size: 20px;",
      new Card().palette()
    );
    this.setState({
      template: new Card().palette()
    });
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return (
      <View className="index">
        {
          // @ts-ignore
          <painter
            customStyle="margin-left:40rpx"
            palette={this.state.template}
            onImgOK={this.onImgOK}
          />
        }
        <Button className="save-button" onClick={this.saveImage}>
          保存
        </Button>
      </View>
    );
  }
}
