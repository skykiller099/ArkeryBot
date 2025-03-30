const { PermissionsBitField } = require("discord.js");
const { DEVELOPER_ID } = require("../config");

const PERMISSION_LEVELS = {
  MODERATOR: 1,
  ADMINISTRATOR: 2,
  CODEVELOPER: 3,
  DEVELOPER: 4,
};

async function checkPermission(userId, requiredLevel, dbConnection) {
  if (userId === DEVELOPER_ID) {
    return PERMISSION_LEVELS.DEVELOPER >= requiredLevel;
  }

  try {
    const [rows] = await dbConnection.execute(
      "SELECT permission_level FROM staff_permissions WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) return false;
    return rows[0].permission_level >= requiredLevel;
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    return false;
  }
}

function hasAdminPermission(member) {
  return member.permissions.has(PermissionsBitField.Flags.Administrator);
}

function isGuildOwner(member) {
  return member.id === member.guild.ownerId;
}

module.exports = {
  checkPermission,
  hasAdminPermission,
  isGuildOwner,
  PERMISSION_LEVELS,
};
