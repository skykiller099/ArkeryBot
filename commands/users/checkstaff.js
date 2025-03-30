const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getConnection } = require("../../utils/databaseUtils");
const { PERMISSION_LEVELS } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("checkstaff")
    .setDescription("Vérifie si un utilisateur est membre du staff.")
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription("L'utilisateur à vérifier.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser("utilisateur");
    const dbConnection = await getConnection();

    try {
      const [rows] = await dbConnection.execute(
        "SELECT permission_level FROM staff_permissions WHERE user_id = ?",
        [targetUser.id]
      );

      if (rows.length === 0) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#F1C40F") // Jaune pour les avertissements
              .setDescription(`<@${targetUser.id}> n'est pas membre du staff.`)
              .setThumbnail(
                "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940"
              )
              .setFooter({
                text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
                iconURL:
                  "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940",
              }),
          ],
        });
      }

      const permissionLevel = rows[0].permission_level;
      const permissionName = getPermissionName(permissionLevel);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#2ECC71") // Vert pour le succès
            .setDescription(`<@${targetUser.id}> est membre du staff.`)
            .addFields(
              {
                name: "Niveau de permission",
                value: permissionLevel.toString(),
              },
              { name: "Nom de la permission", value: permissionName }
            )
            .setTimestamp()
            .setThumbnail(
              "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940"
            )
            .setFooter({
              text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
              iconURL:
                "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940",
            }),
        ],
      });
    } catch (error) {
      console.error("Erreur lors de la vérification du staff:", error);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#E74C3C") // Rouge pour les erreurs
            .setDescription(
              "Une erreur est survenue lors de la vérification du staff."
            )
            .addFields(
              { name: "Code d'erreur", value: error.code || "UNKNOWN_ERROR" },
              {
                name: "Message d'erreur",
                value: error.message || "Aucun message d'erreur disponible.",
              }
            )
            .setTimestamp()
            .setThumbnail(
              "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940"
            )
            .setFooter({
              text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
              iconURL:
                "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940",
            }),
        ],
        ephemeral: true,
      });
    } finally {
      await dbConnection.end();
    }
  },
};

function getPermissionName(permissionLevel) {
  for (const name in PERMISSION_LEVELS) {
    if (PERMISSION_LEVELS[name] === permissionLevel) {
      return name;
    }
  }
  return "Inconnu";
}
