(function() {

    function formatDate(date, fmt) {
        if (!date) {
            return ''
        }
        if (typeof date === 'string') {
            const strdate = date;
            date = new Date(strdate);
            if (isNaN(date.getFullYear())) {
                date = new Date(strdate.replace(/-/g, '/'));
            }
        }
        const yyyy = date.getFullYear();
        var MM = date.getMonth() + 1;
        if (MM.length === 1) { MM = '0' + MM };
        var dd = date.getDate();
        if (dd.length === 1) { dd = '0' + dd };
        var hh = date.getHours();
        if (hh.length === 1) { hh = '0' + hh };
        var mm = date.getMinutes();
        if (mm.length === 1) { mm = '0' + mm };
        var ss = date.getSeconds();
        if (ss.length === 1) { ss = '0' + dd };

        return fmt.replace('yyyy', yyyy).replace('MM', MM).replace('dd', dd).replace('hh', hh).replace('mm', mm).replace('ss', ss);
    }

    function fontColorByDrp(drp) {
        if (drp < 10) {
            return 'rgb(84, 195, 84)';
        } else if (drp < 25) {
            return 'rgb(189, 224, 9)';
        } else if (drp < 50) {
            return 'rgb(232, 108, 47)';
        } else if (drp < 100) {
            return 'rgb(215, 16, 16)';
        } else if (drp < 250) {
            return 'rgb(197, 70, 182)';
        }
        return 'rgb(136, 11, 29)';
    }

    function QueryString(win) {
        if (win == null) {
            win = window;
        }
        var query_string = {};
        var query = decodeURIComponent(win.location.search.substring(1));
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], pair[1]];
                query_string[pair[0]] = arr;
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        }
        return query_string;
    };

    function guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
    function wxlogin(loginUrl, moduleName, code, cb) {
        var theUserObj = {};
        try {
            var cacheObj = JSON.parse(localStorage[`${moduleName}_userobj`]);
            if (cacheObj) {
                theUserObj.theUser = cacheObj.theUser;
                theUserObj.theUid = cacheObj.theUid;
                theUserObj.theUname = cacheObj.theUname;
                theUserObj.theCacheTm = cacheObj.theCacheTm || 0;
            }
        } catch (e) {
            theUserObj.theCacheTm = 0;
        }

        const curTm = new Date().getTime();
        if (!theUserObj.theUser || !theUserObj.theUid || (code && curTm - theUserObj.theCacheTm > 60 * 60 * 1000)) {
            $.ajax({
                url: loginUrl,
                data: {
                    code: qs.code,
                    user: DEBUG_USER,
                    uid: DEBUG_UID
                }
            }).done(function(data) {
                if (data.result && data.data) {
                    theUserObj.theUser = data.data.user;
                    theUserObj.theUid = data.data.uid;
                    theUserObj.theUname = data.data.name;
                    theUserObj.theCacheTm = curTm;
                }
                if (theUserObj.theUser && theUserObj.theUid) {
                    localStorage[`${moduleName}_userobj`] = JSON.stringify(theUserObj);
                    cb(theUserObj);
                } else {
                    $.toptip(data.desc || '获取用户信息失败', 'error');
                }
            }).fail(function () {
                $.toptip('获取用户信息失败', 'error');
            });
        } else {
            cb(theUserObj);
        }
    }

    window._cutil = {
        formatDate,
        fontColorByDrp,
        QueryString,
        guid,
        wxlogin,
    };
})();