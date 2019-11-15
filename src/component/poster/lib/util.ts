/*
 * @Author: dyr
 * @Description: 通用方法
 * @Date: 2019-11-06 18:48:23
 * @LastEditors: dyr
 * @LastEditTime: 2019-11-15 20:28:00
 */
import Taro from "@tarojs/taro";

export const isValidUrl = (url) => {
  return /(ht|f)tp(s?):\/\/([^ \\/]*\.)+[^ \\/]*(:[0-9]+)?\/?/.test(url);
}

/**
 * 深度对比两个对象是否一致
 * from: https://github.com/epoberezkin/fast-deep-equal
 * @param  {Object} a 对象a
 * @param  {Object} b 对象b
 * @return {Boolean}   是否相同
 */
/* eslint-disable */
export const equal = (a, b) => {
  if (a === b) return true;

  if (a && b && typeof a == "object" && typeof b == "object") {
    var arrA = Array.isArray(a),
      arrB = Array.isArray(b),
      i,
      length,
      key;

    if (arrA && arrB) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;
      return true;
    }

    if (arrA != arrB) return false;

    var dateA = a instanceof Date,
      dateB = b instanceof Date;
    if (dateA != dateB) return false;
    if (dateA && dateB) return a.getTime() == b.getTime();

    var regexpA = a instanceof RegExp,
      regexpB = b instanceof RegExp;
    if (regexpA != regexpB) return false;
    if (regexpA && regexpB) return a.toString() == b.toString();

    var keys = Object.keys(a);
    length = keys.length;

    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0; ) {
      key = keys[i];
      if (!equal(a[key], b[key])) return false;
    }

    return true;
  }

  return a !== a && b !== b;
}
/**
 * @description: 获取设备权限
 * @param {string} scope 需要获取权限的 scope
 * @return: Promise<boolean>
 */
export const getAuthSetting = (scope: string): Promise<boolean> => {
  return new Promise(resolve => {
    return Taro.authorize({
      scope
    })
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
};

/**
 * @description: 保存图片到系统相册
 * @param {string} imgUrl 图片url
 * @return: Promise<boolean>
 */
export const saveImageToPhotosAlbum = (imgUrl: string): Promise<boolean> => {
  return new Promise((resolve, rejecet) => {
    return Taro.saveImageToPhotosAlbum({ filePath: imgUrl })
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        rejecet(false);
      });
  });
};
