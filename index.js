const fs = require("fs");
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegtran = require('imagemin-jpegtran');
const rmdir = require('rimraf');

function imgShrink(dir) {
  return new Promise((imgResolve, imgReject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        throw err;
      }
      let actions = []
      files.forEach((file) => {
        let action = () => {
          return new Promise((resolve, reject) => {
            var _src = `${dir}/${file}`
            fs.stat(_src, async (err, st) => {
              if (err) {
                throw err;
              }
              // 判断是否为文件
              if (st.isFile()) {
                if (file.includes('.png') || file.includes('.jpg')) {
                  let dest = dir.split('/').splice(1).join('/')
                  const newPic = await imagemin([_src], {
                    destination: `_imageShrink/${dest}`,
                    plugins: [
                      imageminJpegtran(),
                      imageminPngquant({
                        quality: [0.6, 0.8]
                      })
                    ]
                  });

                  fs.unlinkSync(_src);
                  fs.renameSync(newPic[0].destinationPath, _src)

                  resolve()
                } else {
                  resolve()
                }
              } else if (st.isDirectory()) {
                imgShrink(_src).then(() => {
                  resolve()
                });
              }
            });
          })
        }
        actions.push(action())
      });
      Promise.all(actions).then(() => {
        imgResolve()
      });
    });
  })
}


exports.imageShrink = () => {
  imgShrink('./sb/images').then(res => {
    rmdir('./_imageShrink', () => {
      console.log('imageShrink done')
    })
  })
}






