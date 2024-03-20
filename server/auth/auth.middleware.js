const requireLogin = (req, res, next) => {
  if (!req.session.user) {
      return res.status(401).send('Unauthorized');
  }
  next();
}
  
const requireSameUser = (req, res, next) => {
  if (req.session.user !== req.params.id) {
      return res.status(401).send('Unauthorized');
  }
  next();
}

module.exports = { requireLogin, requireSameUser };