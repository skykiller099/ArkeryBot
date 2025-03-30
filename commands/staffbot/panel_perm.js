const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  WebhookClient,
} = require("discord.js");
const {
  checkPermission,
  PERMISSION_LEVELS,
} = require("../../utils/permissions");
const { getConnection } = require("../../utils/databaseUtils");

const WEBHOOK_CHANNELS = {
  systemActivation: "1355699628225720371",
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
          "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940"
        )
        .setFooter({
          text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
          iconURL:
            "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940",
        });
      return interaction.reply({ embeds: [errorEmbed] });
    }

    const availablePermissions = getAvailablePermissions(staffPerm);

    if (availablePermissions.length === 0) {
      const warningEmbed = new EmbedBuilder()
        .setColor("#F1C40F")
        .setDescription("Aucune permission disponible pour votre niveau.")
        .setTimestamp()
        .setThumbnail(
          "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940"
        )
        .setFooter({
          text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
          iconURL:
            "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940",
        });
      return interaction.reply({ embeds: [warningEmbed] });
    }

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("panel_perm_select")
        .setPlaceholder("Sélectionnez des permissions")
        .setMinValues(1)
        .setMaxValues(availablePermissions.length)
        .addOptions(availablePermissions)
    );

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("Panel de gestion des permissions")
      .setDescription(
        "Choisissez les permissions à attribuer. Voici les permissions disponibles pour votre niveau :"
      )
      .addFields(
        availablePermissions.map((perm) => ({
          name: perm.label,
          value: perm.description,
        }))
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

    const webhookEmbed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("Activation du système")
      .setDescription("Panel de gestion des permissions activé.")
      .addFields(
        { name: "Système", value: "Panel de gestion des permissions" },
        {
          name: "Exécuté par",
          value: `<@${interaction.user.id}> (${interaction.user.id})`,
        },
        {
          name: "Serveur",
          value: `${interaction.guild.name} (${interaction.guild.id})`,
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
      });

    await sendWebhook(client, "systemActivation", webhookEmbed);

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};

function getAvailablePermissions(staffPerm) {
  const permissions = [];

  if (staffPerm >= PERMISSION_LEVELS.MODERATOR) {
    permissions.push(
      {
        label: "Gérer les messages",
        value: "manage_messages",
        description:
          "Donne la permission de supprimer et modifier les messages.",
      },
      {
        label: "Muter les membres",
        value: "mute_members",
        description:
          "Donne la permission de restreindre la parole des membres.",
      },
      {
        label: "Déplacer les membres",
        value: "move_members",
        description:
          "Donne la permission de déplacer les membres entre les salons vocaux.",
      }
    );
  }

  if (staffPerm >= PERMISSION_LEVELS.ADMINISTRATOR) {
    permissions.push(
      {
        label: "Gérer les rôles",
        value: "manage_roles",
        description:
          "Donne la permission de créer, modifier et supprimer les rôles.",
      },
      {
        label: "Gérer les salons",
        value: "manage_channels",
        description:
          "Donne la permission de créer, modifier et supprimer les salons.",
      },
      {
        label: "Gérer les pseudos",
        value: "manage_nicknames",
        description: "Donne la permission de modifier les pseudos des membres.",
      },
      {
        label: "Kick les membres",
        value: "kick_members",
        description: "Donne la permission d'expulser les membres du serveur.",
      }
    );
  }

  if (staffPerm >= PERMISSION_LEVELS.CODEVELOPER) {
    permissions.push(
      {
        label: "Bannir les membres",
        value: "ban_members",
        description:
          "Donne la permission de bannir définitivement les membres du serveur.",
      },
      {
        label: "Gérer les emojis et stickers",
        value: "manage_emojis_and_stickers",
        description:
          "Donne la permission de gérer les emojis et stickers du serveur.",
      },
      {
        label: "Gérer les webhooks",
        value: "manage_webhooks",
        description:
          "Donne la permission de créer, modifier et supprimer les webhooks.",
      },
      {
        label: "Gérer les événements",
        value: "manage_events",
        description:
          "Donne la permission de créer, modifier et supprimer les événements du serveur.",
      },
      {
        label: "Administrateur",
        value: "administrator",
        description:
          "Donne toutes les permissions d'administration du serveur.",
      }
    );
  }

  return permissions;
}

async function sendWebhook(client, type, embed) {
  const channelId = WEBHOOK_CHANNELS[type];
  if (!channelId) return;

  try {
    const webhookClient = new WebhookClient({
      channelId: channelId,
      token: (await client.channels.fetch(channelId)).createWebhook({
        name: "System Logs",
      }).token,
    });
    await webhookClient.send({ embeds: [embed] });
    await webhookClient.destroy();
  } catch (error) {
    console.error(`Erreur lors de l'envoi du webhook "${type}":`, error);
  }
}
