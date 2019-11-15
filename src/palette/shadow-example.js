/*
 * @Author: dyr
 * @Description: file content
 * @Date: 2019-11-06 18:48:23
 * @LastEditors: dyr
 * @LastEditTime: 2019-11-15 16:01:19
 */
export default class ShadowExample {
  palette() {
    return ({
      width: '654rpx',
      height: '400rpx',
      background: '#eee',
      views: [{
        type: 'image',
        url: '/static/sky.jpg',
        css: {
          shadow: '10rpx 10rpx 5rpx #888888',
        },
      },
      {
        type: 'rect',
        css: {
          width: '250rpx',
          height: '150rpx',
          right: '50rpx',
          top: '60rpx',
          shadow: '-10rpx 10rpx 5rpx #888888',
          color: 'linear-gradient(-135deg, #fedcba 0%, rgba(18, 52, 86, 1) 20%, #987 80%)',
        },
      },
      {
        type: 'qrcode',
        content: 'https://github.com/Kujiale-Mobile/Painter',
        css: {
          top: '230rpx',
          width: '120rpx',
          height: '120rpx',
          shadow: '10rpx 10rpx 5rpx #888888',
        },
      },
      {
        type: 'text',
        text: "shadow: '10rpx 10rpx 5rpx #888888'",
        css: {
          left: '180rpx',
          fontSize: '30rpx',
          shadow: '10rpx 10rpx 5rpx #888888',
          top: '290rpx',
        },
      },
      ],
    });
  }
}
