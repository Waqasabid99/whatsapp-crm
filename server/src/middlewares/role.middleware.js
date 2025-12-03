const allowRoles = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission for this action.",
      });
    }
    next();
  };
};

export default allowRoles ;