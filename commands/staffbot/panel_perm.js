const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const {
  checkPermission,
  PERMISSION_LEVELS,
} = require("../../utils/permissions");
const { getConnection } = require("../../utils/databaseUtils");
const { sendWebhookNotification } = require("../../utils/webhookUtils");
const { getPermissionsByLevel } = require("../../utils/permissionUtils");

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
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#E74C3C")
            .setDescription("Vous n'avez pas les permissions nécessaires.")
            .setTimestamp()
            .setThumbnail("URL_MINIATURE")
            .setFooter({ text: "๖̶ζ͜͡Arkery͜͡ζ̶๖", iconURL: "URL_MINIATURE" }),
        ],
        ephemeral: true,
      });
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "panel_perm_level_select") {
        const selectedLevel = interaction.values[0].split("_")[1];
        const permissions = getPermissionsByLevel(parseInt(selectedLevel));

        const permissionOptions = permissions.map((perm) => ({
          label: perm.label,
          value: perm.value,
          description: perm.description,
        }));

        const permissionSelect = new StringSelectMenuBuilder()
          .setCustomId("panel_perm_permissions_select")
          .setPlaceholder("Sélectionnez les permissions")
          .setMinValues(1)
          .setMaxValues(permissions.length)
          .addOptions(permissionOptions);

        const row2 = new ActionRowBuilder().addComponents(permissionSelect);

        return interaction.update({ components: [row2] });
      }

      if (interaction.customId === "panel_perm_permissions_select") {
        const selectedPermissions = interaction.values;
        const roleName = `Permissions-Niveau-${
          interaction.message.components[0].components[0].values[0].split(
            "_"
          )[1]
        }`;
        const role = await interaction.guild.roles.create({
          name: roleName,
          permissions: selectedPermissions,
        });

        sendWebhookNotification(client, "roleCreated", {
          title: "Rôle de permissions créé",
          description: `Le rôle ${role.name} a été créé avec les permissions sélectionnées.`,
          fields: [{ name: "Rôle", value: `<@&${role.id}>` }],
        });

        return interaction.reply({
          content: `Le rôle ${role.name} a été créé avec succès !`,
          ephemeral: true,
        });
      }
    } else {
      const levelOptions = Object.keys(LEVEL_LABELS)
        .filter((level) => parseInt(level) <= staffPerm)
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
        .setThumbnail("URL_MINIATURE")
        .setFooter({ text: "๖̶ζ͜͡Arkery͜͡ζ̶๖", iconURL: "URL_MINIATURE" });

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

      return interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: false,
      });
    }
  },
};
