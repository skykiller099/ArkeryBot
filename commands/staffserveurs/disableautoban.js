const {
  SlashCommandBuilder,
  EmbedBuilder,
  WebhookClient,
} = require("discord.js");
const {
  checkPermission,
  hasAdminPermission,
  isGuildOwner,
} = require("../../utils/permissions");
const { getConnection } = require("../../utils/databaseUtils");

const WEBHOOK_CHANNELS = {
  autoban: "1355699988215689236",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("disableautoban")
    .setDescription(
      "Désactive la synchronisation automatique des bannissements"
    ),
  async execute(interaction, client) {
    const dbConnection = await getConnection();

    const isAdmin = hasAdminPermission(interaction.member);
    const isOwner = isGuildOwner(interaction.member);
    const hasPerm = await checkPermission(interaction.user.id, 2, dbConnection);

    if (!(isAdmin || isOwner || hasPerm)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#E74C3C")
            .setDescription(
              "Vous n'avez pas les permissions nécessaires pour désactiver la synchronisation automatique des bannissements."
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
    }

    try {
      await dbConnection.execute(
        "UPDATE guild_settings SET auto_ban_enabled = false WHERE guild_id = ?",
        [interaction.guild.id]
      );

      const successEmbed = new EmbedBuilder()
        .setColor("#fffff1")
        .setDescription(
          "✅ La synchronisation automatique des bannissements a été désactivée avec succès pour ce serveur."
        )
        .addFields(
          {
            name: "Serveur",
            value: `${interaction.guild.name} (${interaction.guild.id})`,
          },
          {
            name: "Utilisateur",
            value: `${interaction.user.tag} (${interaction.user.id})`,
          },
          {
            name: "Permissions utilisées",
            value: isGuildOwner(interaction.member)
              ? "Propriétaire du serveur"
              : hasAdminPermission(interaction.member)
              ? "Administrateur"
              : "Membre du staff",
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

      const webhookEmbed = new EmbedBuilder()
        .setColor("#3498DB")
        .setTitle("Autoban désactivé")
        .setDescription(
          "La synchronisation automatique des bannissements a été désactivée."
        )
        .addFields(
          {
            name: "Serveur",
            value: `${interaction.guild.name} (${interaction.guild.id})`,
          },
          {
            name: "Utilisateur",
            value: `<@${interaction.user.id}> (${interaction.user.id})`,
          },
          {
            name: "Permissions utilisées",
            value: isGuildOwner(interaction.member)
              ? "Propriétaire du serveur"
              : hasAdminPermission(interaction.member)
              ? "Administrateur"
              : "Membre du staff",
          },
          {
            name: "État",
            value: "Désactivé",
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

      await sendWebhook(client, "autoban", webhookEmbed);

      return interaction.reply({ embeds: [successEmbed], ephemeral: false });
    } catch (error) {
      console.error("Erreur lors de la désactivation de l'autoban:", error);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#E74C3C")
            .setDescription(
              "Une erreur est survenue lors de la désactivation de la synchronisation automatique des bannissements."
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

async function sendWebhook(client, type, embed) {
  const channelId = WEBHOOK_CHANNELS[type];
  if (!channelId) return;

  try {
    const webhookClient = new WebhookClient({
      channelId: channelId,
      token: (await client.channels.fetch(channelId)).createWebhook({
        name: "Autoban Logs",
      }).token,
    });
    await webhookClient.send({ embeds: [embed] });
    await webhookClient.destroy();
  } catch (error) {
    console.error(`Erreur lors de l'envoi du webhook "${type}":`, error);
  }
}
