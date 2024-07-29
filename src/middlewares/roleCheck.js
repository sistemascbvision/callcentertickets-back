// src/middlewares/roleCheck.js
module.exports = (roles) => {
    return (req, res, next) => {
      if (!req.userData || !roles.includes(req.userData.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    };
  };

//esto aun no se implementa completamente