(function () {
    var tf = window.fetch;
    var div = document.createElement('div');
    // the main selector
    div.style.position = 'fixed';
    div.style.top = '0px';
    div.style.left = '0px';
    div.style.width = 'calc(100% - 16px)';
    div.style.height = 'calc(100% - 16px)';
    div.style.backgroundColor = 'black';
    div.style.padding = '8px';
    div.style.fontFamily = 'monospace';
    div.style.color = 'white';
    // in case of emergency
    var cachedKernel = null;
    if(kutil.sysrom.exists('KERNEL.js')) {
        cachedKernel = kutil.sysrom.read('KERNEL.js');
        kutil.sysrom.rm('KERNEL.js');
    };
    var savedKernels = [];
    if(!kutil.sysrom.exists('KeBL-Kernel')) {
        kutil.sysrom.write('KeBL-Kernel', "[]");
    };
    var parsedz = function (imp) {
        var dz = Array.from(imp);
        var mdat = {
            title: null,
            author: null,
            version: null,
            family: null,
            isW96: false,
            isCachedKnl: false
        };
        dz.forEach(dq => {
            if(dq.startsWith('// $KeBL:Title ')) {
                mdat.title = dq.slice(15);
            } else if(dq.startsWith('// $KeBL:Author ')) {
                mdat.author = dq.slice(16);
            } else if(dq.startsWith('// $KeBL:Family ')) {
                mdat.family = dq.slice(16);
            } else if(dq.startsWith('// $KeBL:Version ')) {
                mdat.version = dq.slice(17);
            }
        });
        return mdat;
    };
    (function () {
        try {
            var kg = JSON.parse(
                kutil.sysrom.read('KeBL-Kernel')
            );
            if(!(kg instanceof Array)) {
                kg = [];
            }
        } catch (error) {
            var kg = [];
        }
        if(kg instanceof Array) {
            var ki;
            var kiss;
            var dz;
            kg.forEach(kgi => {
                if(typeof kgi === 'string') {
                    if(kutil.sysrom.exists('KeBL/'+kgi)) {
                        ki = kutil.sysrom.read('KeBL/'+kgi);
                        kiss = ki.split('\n');
                        dz = [];
                        kiss.forEach(xq => {
                            if(
                                xq.startsWith('// $KeBL:')
                                || xq === '// $KeBL'
                            ) {
                                dz.push(zq)
                            }
                        });
                        if(dz[0] === ('// $KeBL')) {
                            savedKernels.push({
                                path: 'KeBL/'+kgi,
                                mdat: parsedz(dz)
                            });
                        }
                    }
                }
            });
        }
    })();
    var selectOpSys = function (knLs) {
        return new Promise(function (done, kick) {
            var kkE = [];
            var sel = 0;
            knLs.forEach(knl => {
                var ke = document.createElement('div');
                var pt = document.createElement('p');
                pt.style.fontSize = '28px';
                pt.style.margin = '0px';
                ke.appendChild(pt);
                if(knl.mdat.title) {
                    pt.innerText = knl.mdat.title;
                    var zt = document.createElement('p');
                    zt.style.fontSize = '14px';
                    zt.style.margin = '0px';
                    zt.innerText = knl.path;
                    ke.appendChild(zt);
                } else {
                    pt.innerText = knl.path;
                }
                var at = document.createElement('p');
                at.style.margin = '0px';
                at.style.fontSize = '14px';
                if(knl.mdat.author || knl.mdat.version) {
                    ke.appendChild(at);
                    if(knl.mdat.author && knl.mdat.version) {
                        at.innerText = knl.mdat.author + ' / v.'+knl.mdat.version;
                    } else if(knl.mdat.author) {
                        at.innerText = 'Kernel by ' + knl.mdat.author;
                    } else {
                        at.innerText = 'Kernel v.'+knl.mdat.version
                    }
                };
                kkE.push(ke);
                div.appendChild(ke);
            });
            kkE[0].style.backgroundColor = 'white';
            kkE[0].style.color = 'black';
            var kh = function (event) {
                if(event.keyCode === 40 || event.key === 'ArrowDown') {
                    if(sel < knLs.length - 1) {
                        sel++;
                        kkE.forEach((kE,kI) => {
                            if(kI === sel) {
                                kE.style.backgroundColor = 'white';
                                kE.style.color = 'black';
                            } else {
                                kE.style.backgroundColor = '';
                                kE.style.color = '';
                            }
                        });
                    }
                } else if(event.keyCode === 38 || event.key === 'ArrowUp') {
                    if(sel > 0) {
                        sel--;
                        kkE.forEach((kE,kI) => {
                            if(kI === sel) {
                                kE.style.backgroundColor = 'white';
                                kE.style.color = 'black';
                            } else {
                                kE.style.backgroundColor = '';
                                kE.style.color = '';
                            }
                        });
                    }
                } else if(event.keyCode === 13 || event.key === 'Enter') {
                    div.parentNode.removeChild(div);
                    window.removeEventListener('keydown',kh);
                    done({
                        id: sel,
                        kernel: knLs[sel]
                    });
                }
            };
            window.addEventListener('keydown',kh);
            document.body.appendChild(div);
        });
    };
    window.fetch = async function (url, options) {
        window.fetch = tf; // restore the real fetch;
        var kL = [
            {
                path: KERNEL_URL,
                mdat: {
                    title: "Windows 96",
                    version: "3.2.3",
                    author: DEV ? 'Official Developer Build' : 'Official Stable Release',
                    isW96: true
                }
            }
        ];
        if(cachedKernel) {
            // It would already be past the cache-checking part
            kutil.sysrom.write('KERNEL.js', cachedKernel);
            kL.push({
                path: 'KERNEL.js',
                mdat: {
                    title: "Cached Kernel",
                    author: "This is usually a Windows 96 kernel.",
                    version: "3.2.3"
                }
            });
        }
        savedKernels.forEach(sk => kL.push(sk));
        var done = await selectOpSys(kL);
        var choice = done.kernel;
        if(choice.mdat.isW96) {
            return await tf(url, options);
        } else {
            var text = kutil.sysrom.read(choice.path);
            return {
                text: async function () {
                    return text;
                }
            }
        }
    };
})();
