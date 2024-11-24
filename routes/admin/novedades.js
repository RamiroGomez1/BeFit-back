var express = require('express');
var router = express.Router();
var novedadesModel = require('../../models/novedadesModel');
var util = require('util')
var cloudinary = require('cloudinary').v2
const uploader = util.promisify(cloudinary.uploader.upload);
const destroy =  util.promisify(cloudinary.uploader.destroy);

const { route } = require('./login');

/* GET novedades page. */
router.get('/', async function (req, res, next) {
  var novedades = await novedadesModel.getNovedades();
  
  novedades = novedades.map(novedad => {
    if (novedad.img_id) {
      const imagen = cloudinary.image(novedad.img_id, {
        width: 100,
        height: 100,
        crop: 'fill'
      });
      return {
        ...novedad,
        imagen
      }
    } else {
      return {
        ...novedad,
        imagen: ''
      }
    }
  })

  res.render('admin/novedades', {
    layout: 'admin/layout',
    persona: req.session.nombre,
    novedades
  });
});

router.get('/agregar', (req, res, next) => {
  res.render('admin/agregar', {
    layout: 'admin/layout'
  })
})

router.post('/agregar' //cuando el boton para agregar sea presionado, que se ejecute esta funcion
  , async (req, res, next) => {
  try {
    var img_id = 'id';
    if(req.files && Object.keys(req.files).length > 0) {
      imagen = req.files.imagen;
      img_id = (await uploader(imagen.tempFilePath)).public_id;
    }

    if(req.body.titulo != '' && req.body.subtitulo != '' && req.body.cuerpo != '') // Si todos los campos de la nueva novedad estan completos, haz lo siguiente
     {
      await novedadesModel.insertNovedad({
        ...req.body,
        img_id
      });// mete la info de la novedad nueva en insertNovedad como objeto
      res.redirect('/admin/novedades') //mandame a la pagina de novedades ya con mi novedad nueva puesta
    } else {
      res.render('admin/agregar', {
        layout: 'admin/layout',
        error: true,
        message: 'Todos los campos son requeridos'
      })
    }
  } catch (error) {
    console.log(error)
    res.render('admin/agregar', {
      layout: 'admin/layout',
      error: true,
      message: 'No se cargo la novedad'
    })
  }
})


router.get('/borrar/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    let novedad = await novedadesModel.getNovedadesById(id)
    if(novedad.img_id) {
      await (destroy(novedad.img_id))
    }

      await novedadesModel.deleteNovedad(id);
      res.redirect('/admin/novedades') 
  } catch (error) {
    console.log(error)
    res.render('admin/novedades', {
      layout: 'admin/layout',
      error: true,
      message: 'No se pudo eliminar la novedad'
    })
  }
})

router.get('/editar/:id', async (req, res, next) => {

  try {
      var id = req.params.id;
      var novedad = await novedadesModel.getNovedadesById(id);

      res.render('admin/editar', {
        layout:'admin/layout',
        novedad
      }) 
  } catch (error) {
    console.log(error)
  }
})



router.post('/editar', async (req, res, next) => {
      try {

        let img_id = req.body.img_original;
        let borrar_img_vieja = false;
        if(req.body.img_delete === '1') {
          img_id = null;
          borrar_img_vieja = true
        } else {
          if(req.files && Object.keys(req.files).length > 0) {
            imagen = req.files.imagen;
            img_id = (await uploader(imagen.tempFilePath)).public_id;
            borrar_img_vieja = true
          }
        }
        if(borrar_img_vieja && req.body.img_original) {
          await (destroy(req.body.img_original))
        }


        var id = req.body.id;
        var obj = {
          titulo: req.body.titulo,
          subtitulo: req.body.subtitulo,
          cuerpo: req.body.cuerpo,
          img_id
        }

        await novedadesModel.editarNovedadById(obj, id);
        res.redirect('/admin/novedades');
      } catch (error) {
        console.log(error)
        res.render('admin/editar', {
          layout: 'admin/layout',
          error: true,
          message:'No se pudo editar la novedad'
        })
      }
})



module.exports = router;