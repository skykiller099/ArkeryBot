const { getConnection } = require("../utils/databaseUtils");

module.exports = {
  name: "guildBanAdd",
  async execute(ban, client) {
    const dbConnection = await getConnection();

    try {
      const { guild, user } = ban;

      await dbConnection.execute(
        "INSERT IGNORE INTO banned_users (user_id, reason, banned_by) VALUES (?, ?, ?)",
        [user.id, "Ban synchronisé depuis un serveur", guild.id]
      );

      console.log(
        `Utilisateur <span class="math-inline">\{user\.tag\} \(</span>{user.id}) banni sur ${guild.name} ajouté à la base de données`
      );

      const [rows] = await dbConnection.execute(
        "SELECT guild_id FROM guild_settings WHERE auto_ban_enabled = true"
      );

      for (const row of rows) {
        const targetGuildId = row.guild_id;

        if (targetGuildId === guild.id) continue;

        const targetGuild = client.guilds.cache.get(targetGuildId);
        if (!targetGuild) continue;

        try {
          await targetGuild.members.ban(user.id, {
            reason: "Ban synchronisé via système autoban",
          });
          console.log(
            `Utilisateur <span class="math-inline">\{user\.tag\} \(</span>{user.id}) banni sur ${targetGuild.name} via synchronisation`
          );
        } catch (error) {
          console.error(
            `Erreur lors du bannissement de ${user.id} sur ${targetGuild.name}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Erreur lors du traitement du bannissement:", error);
    } finally {
      await dbConnection.end();
    }
  },
};
