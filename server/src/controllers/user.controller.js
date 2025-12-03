import { prisma } from "../db.js";

const getMyProfile = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      user
    });

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      }
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { getMyProfile, updateProfile };
