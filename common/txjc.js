let adata = null; // 后台返回的所有数据
let sdata = null; // 查询后的数据
let loading = false; // 判断是否加载完毕  false:加载中 ture:加载完毕
let pageNumber = null; // 当前页码数
let pageSize = null; // 每页记录数
let totalPage = null; // 总页数
let lastpage = null; // 是否最后一页
let flag = null; // 是否有需要加载的数据

let theUser = null;
let theUid = null;
let theCacheTm = null;

const qs = _cutil.QueryString();

function resetData() { // 查询前初始化必要参数
    adata = [];
    sdata = [];
    pageNumber = 1;
    pageSize = 9;
    totalPage = 0;
    lastpage = false;
    flag = false;
    loading = false;
}

function login(cb) {
    theUser = localStorage.image_user;
    theUid = localStorage.image_uid;
    theCacheTm = parseInt(localStorage.image_cache_tm, 10) || 0;

    const curTm = new Date().getTime();

    if (!theUser || !theUid || curTm - theCacheTm > 60 * 60 * 1000) {
        $.ajax({
            url: IMAGE_LOGIN,
            data: {
                code: qs.code,
                user: DEBUG_USER,
                uid: DEBUG_UID
            }
        }).done(function(data) {
            if (data.result && data.data) {
                theUser = data.data.user;
                theUid = data.data.uid;
            }
            if (theUser && theUid) {
                localStorage.image_user = theUser;
                localStorage.image_uid = theUid;
                localStorage.image_cache_tm = curTm;

                cb();
            } else {
                $.toptip(data.desc || '获取用户信息失败', 'error');
            }
        }).fail(function () {
            $.toptip('获取用户信息失败', 'error');
        });
    } else {
        cb();
    }
}

function drpRecHtml(rec) {
    // 缩略图 ${ROOT_SERVICE}/image/thumb?address=${decodeURIComponent(rec.address)}&size=128
    return `<a href="./txjc_history.html?stcd=${rec.device_id}&stnm=${rec.stnm}" class="weui-grid js_grid" style="width: 48%;height:128px;margin: 5px 0px;padding: 0px 0px 0px 13px;">               
                <div style="position: relative;width: 100%;height: 100%;">                                                            
                         <span class="sp1">
                          ${rec.stnm}
                         </span>
                          <span class="sp3">
                          ${imgType[rec.content_tp]}
                         </span>
                         <span class="sp2">
                          ${rec.date_time}
                         </span>   
                          <img src="../../image/test/101.png" style="width: 100%;height: 128px;">                                   
                  </div>                 
            </a>`;
}

function _fill_data(data) { // 填充每页的数据
    data.forEach(function (rec) {
        const strHtml = drpRecHtml(rec);
        $('#resultlist').append(strHtml)
    });
}

function getPageList() { // 获后台返回的图像数据列表
    $.ajax({
        url: IMAGE_REAL,
        dataType: 'json',
        async: false,
        data: {
            uid: theUid,
        }
    }).done(function (data) {
        if (Array.isArray(data) && data.length > 0) {
            adata = data;
        }else {
            adata = []; // 无数据时
        }
    }).fail(function () {
        $.toptip('查询出错','error');
    });
}

function filterData() { //  根据查询条件过滤数据
    const name = $("#cname").val();
    if (adata.length > 0){
        if (!name) {
            sdata = adata;
            return;
        }
        adata.forEach(function (rec) {
            if (rec.stnm.indexOf(name) >= 0) {
                sdata.push(rec);
            }
        });
        if (sdata.length === 0) {
            flag = true;
            loading = true;
            $('#resultlist').empty();
            $(".weui-loadmore").empty().append('<div class="weui-loadmore weui-loadmore_line"><span class="weui-loadmore__tips">无符合条件的数据</span></div>').show();
        }
    }else {
        flag = true;
        loading = true;
        $('#resultlist').empty();
        $(".weui-loadmore").empty().append('<div class="weui-loadmore weui-loadmore_line"><span class="weui-loadmore__tips">暂无数据</span></div>').show();
    }
}

function loadData() { // 分页加载过滤后的数据
    if (flag){ // 无符合条件的数据或者无数据时
        return;
    }
    loading = false;
    totalPage = Math.ceil(sdata.length / pageSize);
    lastpage = pageNumber === totalPage;
    if (totalPage > 1) { // 总页数大于1
        if (lastpage){ // 最后一页时
            const onePage = sdata.slice((pageNumber -1) * pageSize,sdata.length);
            _fill_data(onePage);
            $(document.body).destroyInfinite(); // 销毁加载中的插件
            $(".weui-loadmore").empty().append('<div class="weui-loadmore weui-loadmore_line"><span class="weui-loadmore__tips">暂无更多数据</span></div>').show();
        }else{
            const onePage = sdata.slice((pageNumber -1) * pageSize,pageNumber * pageSize); // 每页数据
            _fill_data(onePage);
        }
    }else { // 只有一页时
        const onePage = sdata.slice((pageNumber -1) * pageSize,sdata.length);
        _fill_data(onePage);
        $(document.body).destroyInfinite(); // 销毁加载中的插件
        $('.weui-loadmore').empty().hide();
    }
}

function pagination() { // 滚动事件组件注册
    $(document.body).infinite().on("infinite", function() {
        if(loading){
            return;
        }
        loading = true;
        pageNumber += 1;
        setTimeout(function() {
            loadData();
        }, 50);   // 模拟延迟
    });
}

function doSearch(){
    $('#resultlist').empty(); // 清空列表
    $(".weui-loadmore").empty().append('<i class="weui-loading"></i><span class="weui-loadmore__tips">正在加载</span>').show();
    resetData();
    getPageList();
    filterData();
    pagination();
    loadData();
}

$(function() {
    FastClick.attach(document.body);

    login(function () {
        doSearch();
        $('#btnSearch').click(doSearch);
    });
});