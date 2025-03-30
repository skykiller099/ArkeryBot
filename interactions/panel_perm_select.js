const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const { checkPermission, PERMISSION_LEVELS } = require("../utils/permissions");
const { getConnection } = require("../utils/databaseUtils");
const { getPermissionsByLevel } = require("../utils/permissionUtils");

// Configuration des niveaux de permission avec des labels lisibles
const LEVEL_LABELS = {
  1: "Modérateur",
  2: "Administrateur",
  3: "Co-Développeur",
  4: "Développeur",
};

module.exports = {
  name: "panel_perm_level_select",
  async execute(interaction, client) {
    try {
      const selectedLevel = interaction.values[0].split("_")[1];
      const levelNumber = parseInt(selectedLevel);

      // Vérification que l'utilisateur a bien le niveau requis
      const dbConnection = await getConnection();
      const userPermLevel = await checkPermission(
        interaction.user.id,
        PERMISSION_LEVELS.MODERATOR,
        dbConnection
      );

      if (userPermLevel < levelNumber) {
        return interaction.reply({
          content:
            "Vous n'avez pas le niveau requis pour configurer ces permissions.",
          ephemeral: true,
        });
      }

      // Récupérer les permissions disponibles pour ce niveau
      const availablePermissions = getPermissionsByLevel(levelNumber);

      if (availablePermissions.length === 0) {
        return interaction.reply({
          content: "Aucune permission disponible pour ce niveau.",
          ephemeral: true,
        });
      }

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`panel_perm_select_${levelNumber}`)
          .setPlaceholder(`Permissions niveau ${levelNumber}`)
          .setMinValues(1)
          .setMaxValues(availablePermissions.length)
          .addOptions(availablePermissions)
      );

      const embed = new EmbedBuilder()
        .setColor("#3498DB")
        .setTitle(`Configuration des permissions: Niveau ${levelNumber}`)
        .setDescription(
          `Vous configurez les permissions de niveau **${levelNumber} - ${LEVEL_LABELS[levelNumber]}**. Sélectionnez les permissions souhaitées:`
        )
        .addFields(
          availablePermissions.map((perm) => ({
            name: perm.label,
            value: perm.description,
          }))
        )
        .setTimestamp()
        .setThumbnail(
          "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg"
        )
        .setFooter({
          text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
          iconURL:
            "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg",
        });

      await interaction.update({
        embeds: [embed],
        components: [row],
      });
    } catch (error) {
      console.error("Erreur lors de la sélection du niveau:", error);
      await interaction.reply({
        content: "Une erreur est survenue lors de la sélection du niveau.",
        ephemeral: true,
      });
    }
  },
};
