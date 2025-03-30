const { Events, EmbedBuilder } = require("discord.js");
const { getConnection } = require("../utils/databaseUtils"); // Assurez-vous que le chemin est correct

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.channel.id !== process.env.AUTOBAN_CHANNEL_ID) return; // Vérifie si le message est dans le bon salon

    const userIds = extractUserIds(message.content); // Extrait les IDs utilisateur du message

    if (userIds.length === 0) return; // Si aucun ID trouvé, on arrête

    try {
      const dbConnection = await getConnection();

      for (const userId of userIds) {
        // Vérifie si l'utilisateur existe déjà dans la base de données
        const [existingUser] = await dbConnection.execute(
          "SELECT * FROM banned_users WHERE user_id = ?",
          [userId]
        );

        if (existingUser.length === 0) {
          // Si l'utilisateur n'existe pas, on l'ajoute
          await dbConnection.execute(
            "INSERT INTO banned_users (user_id, reason, banned_by, banned_at) VALUES (?, ?, ?, NOW())",
            [userId, "Scammeur / Hackeur / Irrespect des TOS", client.user.id] // Ajoute la raison et l'ID du bot
          );

          // Envoie un message de confirmation dans le salon
          const embed = new EmbedBuilder()
            .setColor("#E74C3C")
            .setTitle("Utilisateur autobanni !")
            .setDescription(`<@${userId}> a été autobanni.`)
            .addFields(
              { name: "Raison", value: "Autoban via le salon dédié" },
              { name: "Banni par", value: `<@${client.user.id}>` }
            )
            .setTimestamp()
            .setThumbnail(
              "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940"
            )
            .setFooter({
              text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
              iconURL:
                "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940",
            });

          await message.channel.send({ embeds: [embed] });
        }
      }

      await dbConnection.end();
    } catch (error) {
      console.error("Erreur lors de l'autoban :", error);
    }
  },
};

function extractUserIds(text) {
  const userIdRegex = /<@!?(\d+)>/g; // Regex pour détecter les mentions d'utilisateur
  const userIds = [];
  let match;

  while ((match = userIdRegex.exec(text)) !== null) {
    userIds.push(match[1]);
  }

  return userIds;
}
