const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const {
  checkPermission,
  PERMISSION_LEVELS,
} = require("../../utils/permissions");
const { getConnection } = require("../../utils/databaseUtils");
const { sendWebhookNotification } = require("../../utils/webhookUtils");

// Configuration des niveaux de permission avec des labels lisibles
const LEVEL_LABELS = {
  1: "Modérateur",
  2: "Administrateur",
  3: "Co-Développeur",
  4: "Développeur",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel_perm")
    .setDescription("Panel de gestion des permissions pour le staff."),
  async execute(interaction, client) {
    const dbConnection = await getConnection();
    const staffPerm = await checkPermission(
      interaction.user.id,
      PERMISSION_LEVELS.MODERATOR,
      dbConnection
    );

    if (!staffPerm) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#E74C3C")
        .setDescription("Vous n'avez pas les permissions nécessaires.")
        .setTimestamp()
        .setThumbnail(
          "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg"
        )
        .setFooter({
          text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
          iconURL:
            "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg",
        });
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // Création du menu de sélection de niveau
    const levelOptions = Object.keys(LEVEL_LABELS)
      .filter((level) => parseInt(level) <= staffPerm) // Uniquement les niveaux inférieurs ou égaux
      .map((level) => ({
        label: `Niveau ${level} - ${LEVEL_LABELS[level]}`,
        value: `level_${level}`,
        description: `Permissions de niveau ${LEVEL_LABELS[level]}`,
      }));

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("panel_perm_level_select")
        .setPlaceholder("Sélectionnez un niveau de permission")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(levelOptions)
    );

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("Panel de gestion des permissions")
      .setDescription(
        "Choisissez d'abord le niveau de permission que vous souhaitez configurer."
      )
      .addFields(
        {
          name: "Instructions",
          value:
            "1. Sélectionnez un niveau de permission\n2. Choisissez ensuite les permissions spécifiques",
        },
        {
          name: "Votre niveau actuel",
          value: `Niveau ${staffPerm} - ${
            LEVEL_LABELS[staffPerm] || "Personnalisé"
          }`,
        }
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

    // Envoi du webhook de notification d'activation du système
    sendWebhookNotification(client, "systemActivation", {
      title: "Activation du système",
      description: "Panel de gestion des permissions activé.",
      fields: [
        { name: "Système", value: "Panel de gestion des permissions" },
        {
          name: "Exécuté par",
          value: `<@${interaction.user.id}> (${interaction.user.id})`,
        },
        {
          name: "Serveur",
          value: `${interaction.guild.name} (${interaction.guild.id})`,
        },
      ],
    });

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },
};
