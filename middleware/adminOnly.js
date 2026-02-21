function adminOnly(req, res, next) {
  console.log("USER DATA:", req.user);

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin Access Required" });
  }

  next();
}