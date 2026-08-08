function validate(schema) { return (req, res, next) => { const parsed = schema.safeParse({ body:req.body, params:req.params, query:req.query }); if (!parsed.success) return res.status(400).json({ message:'Invalid input', errors: parsed.error.flatten() }); req.validated = parsed.data; next(); }; }
module.exports = validate;
