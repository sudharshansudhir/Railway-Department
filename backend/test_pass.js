import bcrypt from "bcryptjs";

const testPasswords = async () => {
  const hash1 = "$2b$10$3nx3gpjjvIZ1.kt/tQXGh.ZpqBu6CIEEhtWWSglHN2BmI0u8tEaw2";
  
  console.log("admin match:", await bcrypt.compare("admin", hash1));
  console.log("admin123 match:", await bcrypt.compare("admin123", hash1));
  console.log("password match:", await bcrypt.compare("password", hash1));
  console.log("superadmin match:", await bcrypt.compare("superadmin", hash1));
};

testPasswords();
