initLocation();
const qs = _cutil.QueryString();

// 是否正在上传提交
var submitting = false;

var formObject = {
    patrol_userid: null,
    device_id: '',
    patrol_username: '',
    patrol_content: '',
    patrol_size: '',
    p_patrol_tm: '',
    lgtd: '',
    lttd: '',
};

var theUserObj = null;

function initLocation() {
    var geolocation = new BMap.Geolocation();
    geolocation.getCurrentPosition(function (r) {
        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
            $("#f_ll").val(`${r.point.lng.toFixed(6)},${r.point.lat.toFixed(6)}`);
        } else {
            $.toptip('获取经纬度失败:' + this.getStatus());
        }
    }, {
        enableHighAccuracy: true
    });
}

function _initStSelection() {
    $.ajax({
        url: ROOT_SERVICE + '/patrol/stlist',
        data: {
            uid: theUserObj.theUid
        }
    }).done(function (data) {
        if (!Array.isArray(data)) {
            $.toptip('测站信息获取失败');
            return;
        }
        $("#f_device_id").select({
            title: "请选择测站",
            items: data.map(function (rec) {
                return {
                    title: rec.stnm,
                    value: rec.stcd
                };
            }),
        });
    }).fail(function (data) {
        $.toptip('测站信息获取失败');
    })
}

function upload(files) {
    debugger
    var fileReader = new FileReader()
    var blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice;
    var file = files.file;
    //文件每块分割2M，计算分割详情
    var chunkSize = 10 * 1024,
        chunks = Math.ceil(file.size / chunkSize),
        currentChunk = 0,
        //创建md5对象（基于SparkMD5）
        spark = new SparkMD5();
    //每块文件读取完毕之后的处理
    fileReader.onload = function (e) {
        console.log("读取文件", currentChunk + 1, "/", chunks);
        //每块交由sparkMD5进行计算
        spark.appendBinary(e.target.result);
        currentChunk++;
        //如果文件处理完成计算MD5，如果还有分片继续处理
        if (currentChunk < chunks) {
            loadNext();
        }
    };

    //处理单片文件的上传
    function loadNext() {
        var start = currentChunk * chunkSize, end = start + chunkSize >= file.size ? file.size : start + chunkSize;
        fileReader.readAsBinaryString(blobSlice.call(file, start, end));
    }
    loadNext();
}

$(function () {
    FastClick.attach(document.body);
    _cutil.wxlogin(PATROL_LOGIN, "patrol", qs.code, function (userObj) {
        theUserObj = userObj;
        if (userObj) {
            $("#f_patrol_user").val(userObj.theUname);
            formObject.patrol_userid = userObj.theUser;
        }
        _initStSelection();
    });
    $('#btnPosition').click(initLocation);

    var imgUploader = new ImageUploader();

    $("#showTooltips").click(function () {
        if (submitting) {
            return;
        }
        formObject.patrol_username = $('#f_patrol_user').val().trim();
        if (!formObject.patrol_username) {
            $.toptip('请输入巡检人姓名');
            return;
        }
        formObject.device_id = $('#f_device_id').val().trim()
        if (!formObject.device_id) {
            $.toptip('请输入巡检测站');
            return;
        }
        formObject.patrol_content = $('#f_patrol_content').val().trim();
        if (!formObject.patrol_content) {
            $.toptip('请填写巡检内容');
            return;
        }
        formObject.p_patrol_tm = $('#f_p_patrol_tm').val();
        formObject.patrol_size = $('#f_patrol_size').val();
        let formData = new FormData();
        for (var key in formObject) {
            formData.append(key, formObject[key]);
        }
        const imgfiles = imgUploader.getFiles();
        for (const imgfile of imgfiles) {
            formData.append("image", imgfile.file);
        }
        for (var i = 0; i < imgfiles.length; i++) {
            var imgfile = imgfiles[i]
            upload(imgfile)
        }
        return
        submitting = true;
        $.showLoading('提交中，请等待');
        $.ajax({
            url: ROOT_SERVICE + '/patrol/add',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
        }).done(function (data) {
            submitting = false;
            $.hideLoading();
            if (data.result) {
                $.toast("操作成功", function () {
                    location.reload();
                });
            } else {
                $.toptip('提交失败');
            }
        }).fail(function () {
            submitting = false;
            $.hideLoading();
            $.toptip('提交失败');
        });
    });
});

