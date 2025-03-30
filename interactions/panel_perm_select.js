const {
  PermissionsBitField,
  EmbedBuilder,
  WebhookClient,
} = require("discord.js");
const { getConnection } = require("../utils/databaseUtils");
const { checkPermission, PERMISSION_LEVELS } = require("../utils/permissions");

const WEBHOOK_CHANNELS = {
  roleCreated: "1355699628225720371", // Remplacez par l'ID de votre salon de logs
};

module.exports = {
  name: "panel_perm_select",
  async execute(interaction, client) {
    const selectedValues = interaction.values;
    let totalPermissions = new PermissionsBitField();

    for (const selectedValue of selectedValues) {
      const permissionFlag =
        PermissionsBitField.Flags[selectedValue.toUpperCase()];
      if (permissionFlag) {
        totalPermissions.add(permissionFlag);
      }
    }

    try {
      const dbConnection = await getConnection();
      const staffPerm = await checkPermission(
        interaction.user.id,
        PERMISSION_LEVELS.MODERATOR,
        dbConnection
      );

      let staffPermName =
        Object.keys(PERMISSION_LEVELS).find(
          (key) => PERMISSION_LEVELS[key] === staffPerm
        ) || "Inconnu";

      const role = await interaction.guild.roles.create({
        name: `${interaction.user.username} -${staffPermName}- ${interaction.client.user.username} Bot`,
        permissions: totalPermissions,
        reason: `Rôle créé par le panel de permissions pour ${interaction.user.tag}`,
      });

      await interaction.member.roles.add(role);

      const embed = new EmbedBuilder()
        .setColor("#2ECC71")
        .setTitle("Rôle créé avec succès !")
        .setDescription(
          `Le rôle "${role.name}" a été créé et attribué à <@${interaction.user.id}>.`
        )
        .addFields({
          name: "Permissions attribuées",
          value: totalPermissions.toArray().join(", ") || "Aucune",
        })
        .setTimestamp()
        .setThumbnail(
          "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940"
        )
        .setFooter({
          text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
          iconURL:
            "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940",
        });

      await interaction.reply({ embeds: [embed] });

      sendWebhook(client, "roleCreated", {
        guildName: interaction.guild.name,
        guildId: interaction.guild.id,
        roleName: role.name,
        userId: interaction.user.id,
        permissions: totalPermissions.toArray().join(", "),
      });
    } catch (error) {
      console.error("Erreur lors de la gestion des permissions:", error);
      const errorEmbed = new EmbedBuilder()
        .setColor("#E74C3C")
        .setTitle("Erreur !")
        .setDescription(
          "Une erreur est survenue lors de la gestion des permissions."
        )
        .addFields({
          name: "Message d'erreur",
          value: error.message || "Inconnu",
        })
        .setTimestamp()
        .setThumbnail(
          "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940"
        )
        .setFooter({
          text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
          iconURL:
            "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940",
        });
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};

async function sendWebhook(client, type, data) {
  const channelId = WEBHOOK_CHANNELS[type];
  if (!channelId) return;

  try {
    const webhookClient = new WebhookClient({
      channelId: channelId,
      token: (await client.channels.fetch(channelId)).createWebhook({
        name: "System Logs",
      }).token,
    });
    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("Rôle créé")
      .setDescription(`Un rôle a été créé par <@${data.userId}>.`)
      .addFields(
        { name: "Nom du rôle", value: data.roleName },
        { name: "Serveur", value: `${data.guildName} (${data.guildId})` },
        { name: "Permissions", value: data.permissions || "Aucune" }
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
    await webhookClient.send({ embeds: [embed] });
    await webhookClient.destroy();
  } catch (error) {
    console.error(`Erreur lors de l'envoi du webhook "${type}":`, error);
  }
}
