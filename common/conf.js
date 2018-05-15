// const ROOT_SERVICE = 'http://localhost:8080';
// const ROOT_SERVICE = 'http://pixii.tunnel.qydev.com';
// const ROOT_SERVICE = 'http://jjwxtest.cloudowr.cn';
const ROOT_SERVICE = 'http://192.168.1.119:9007/GxhyAgreement';

const _debug = "";

if (_debug) {
    DEBUG_USER = 'wjhclwz121411';
    DEBUG_UID = '0574ea0be547458bb5aeb476be04e85c';
} else {
    DEBUG_USER = '';
    DEBUG_UID = '';
}


// 水情模块
WATER_LOGIN = `${ROOT_SERVICE}/rsvr/login${_debug}`;
WATER_REAL = `${ROOT_SERVICE}/rsvr/real`; // 实时水位
WATER_HISTORY = `${ROOT_SERVICE}/rsvr/listp`; // 历史水位查询

// 雨情模块
RAINFALL_LOGIN = `${ROOT_SERVICE}/pptn/login${_debug}`;
RAINFALL_REAL = `${ROOT_SERVICE}/pptn/real`; // 实时雨量
RAINFALL_HISTORY = `${ROOT_SERVICE}/pptn/listp`; // 历史雨量查询

// 图像监测模块
IMAGE_LOGIN = `${ROOT_SERVICE}/image/login${_debug}`;
IMAGE_REAL = `${ROOT_SERVICE}/image/real`; // 实时图像信息
IMAGE_HISTORY = `${ROOT_SERVICE}/image/listp`; // 历史图像信息查询

// 报警模块
WARN_LOGIN = `${ROOT_SERVICE}/warn/login${_debug}`;
WARN_REAL = `${ROOT_SERVICE}/warn/real`; // 实时报警信息
WARN_HISTORY = `${ROOT_SERVICE}/warn/listp`; // 历史报警信息查询

// 联系人模块
CONTACT_LIST = `${ROOT_SERVICE}/contact/listp`; // 联系人模块

// 巡检模块
PATROL_LOGIN = `${ROOT_SERVICE}/patrol/login${_debug}`;

// 召测
MEASURE_sendDataProtocol = `${ROOT_SERVICE}/temp/sendDataProtocol`;
MEASURE_getReturnResult = `${ROOT_SERVICE}/temp/getReturnResult`;

MEASURE_getImage = 'http://221.222.240.73:8181/GxhyAgreement/communication/getImage';