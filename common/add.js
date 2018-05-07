const qs = _cutil.QueryString();

// 是否正在上传提交什么
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
            /*
            var geoc = new BMap.Geocoder();
            geoc.getLocation(r.point, function(rs){
                var addComp = rs.addressComponents;
                $("#address").val(addComp.city + addComp.district + addComp.street + addComp.streetNumber);
            });
            */
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
            items: data.map(function(rec) {
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

$(function() {
    FastClick.attach(document.body);

    _cutil.wxlogin(PATROL_LOGIN, "patrol", qs.code, function (userObj) {
        theUserObj = userObj;

        if (userObj) {
            $("#f_patrol_user").val(userObj.theUname);
            formObject.patrol_userid = userObj.theUser;
        }

        _initStSelection();
    });

    // initLocation();
    $('#btnPosition').click(initLocation);

    var imgUploader = new ImageUploader();

    $("#showTooltips").click(function() {
        if (submitting) {
            return;
        }
        formObject.patrol_username = $('#f_patrol_user').val().trim();
        if (!formObject.patrol_username) {
            $.toptip('请输入巡检人姓名');
            return;
        }
        formObject.device_id = $('#f_device_id').attr('data-values');
        if (!formObject.device_id) {
            $.toptip('请选择巡检测站');
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
                $.toast("操作成功", function() { location.reload(); });
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