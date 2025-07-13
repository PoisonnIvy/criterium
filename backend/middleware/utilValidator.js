export function validateRequest(required = {}) {
  return (req, res, next) => {
    // required: { params: ['projectId'], query: ['title'], body: ['name'] }
    for (const key of Object.keys(required)) {
      for (const field of required[key]) {
        if (typeof req[key][field] === 'undefined' || req[key][field] === '') {
          return res.status(400).json({ error: `Falta o es inválido: ${key}.${field}` });
        }
      }
    }
    next();
  };
}

/*
Middleware para validar que los campos pasados por parametro no vengan undefined, null o vacío.
se podria extender para validar otras cosas.s

*/