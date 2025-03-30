const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  WebhookClient,
} = require("discord.js");
const { getConnection } = require("../../utils/databaseUtils"); // Assurez-vous que le chemin est correct
const {
  checkPermission,
  PERMISSION_LEVELS,
} = require("../../utils/permissions"); // Assurez-vous que le chemin est correct

const WEBHOOK_CHANNELS = {
  syncBans: "1355885146410324058", // Remplacez par l'ID de votre salon de logs
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("syncbans")
    .setDescription(
      "Synchronise les bannissements de la base de données vers le serveur."
    ),
  async execute(interaction, client) {
    try {
      const dbConnection = await getConnection();
      const staffPerm = await checkPermission(
        interaction.user.id,
        PERMISSION_LEVELS.ADMINISTRATOR,
        dbConnection
      );

      // Vérifie si l'utilisateur est un administrateur, le propriétaire du serveur ou a le niveau de permission 2 ou supérieur
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        ) &&
        interaction.user.id !== interaction.guild.ownerId &&
        staffPerm < PERMISSION_LEVELS.ADMINISTRATOR
      ) {
        const errorEmbed = new EmbedBuilder()
          .setColor("#E74C3C")
          .setDescription(
            "Vous n'avez pas la permission d'utiliser cette commande."
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
        return interaction.reply({ embeds: [errorEmbed] });
      }

      const [bannedUsers] = await dbConnection.execute(
        "SELECT user_id FROM banned_users"
      );

      if (bannedUsers.length === 0) {
        const infoEmbed = new EmbedBuilder()
          .setColor("#F1C40F")
          .setDescription(
            "Aucun utilisateur banni trouvé dans la base de données."
          )
          .setTimestamp()
          .setThumbnail(
            "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940"
          )
          .setFooter({
            text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
            iconURL:
              "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed9352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940",
          });
        return interaction.reply({ embeds: [infoEmbed] });
      }

      let bannedCount = 0;
      let bannedSuccessCount = 0;
      const totalBans = bannedUsers.length;

      const progressEmbed = new EmbedBuilder()
        .setColor("#3498DB")
        .setDescription(
          `Synchronisation des bannissements... (${bannedCount}/${totalBans})`
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

      const progressMessage = await interaction.reply({
        embeds: [progressEmbed],
        fetchReply: true,
      });

      for (const user of bannedUsers) {
        try {
          await interaction.guild.members.ban(user.user_id, {
            reason:
              "Synchronisation des bannissements depuis la base de données.",
          });
          bannedSuccessCount++;
        } catch (error) {
          console.error(
            `Erreur lors du bannissement de ${user.user_id} :`,
            error
          );
        }

        bannedCount++;
        progressEmbed.setDescription(
          `Synchronisation des bannissements... (${bannedCount}/${totalBans})`
        );
        await progressMessage.edit({ embeds: [progressEmbed] });
      }

      const successEmbed = new EmbedBuilder()
        .setColor("#2ECC71")
        .setDescription(
          `${bannedSuccessCount} utilisateurs ont été bannis avec succès.`
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
      await interaction.editReply({ embeds: [successEmbed] });

      await sendWebhook(client, "syncBans", {
        executor: interaction.user.id,
        guildName: interaction.guild.name,
        guildId: interaction.guild.id,
        bannedCount: bannedSuccessCount,
      });

      await dbConnection.end();
    } catch (error) {
      console.error(
        "Erreur lors de la synchronisation des bannissements :",
        error
      );
      const errorEmbed = new EmbedBuilder()
        .setColor("#E74C3C")
        .setDescription(
          "Une erreur est survenue lors de la synchronisation des bannissements."
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
      await interaction.editReply({ embeds: [errorEmbed] });
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
        name: "Sync Bans Logs",
      }).token,
    });
    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("Synchronisation des bannissements")
      .setDescription(
        "Les bannissements de la base de données ont été synchronisés avec le serveur."
      )
      .addFields(
        { name: "Exécuté par", value: `<@${data.executor}>` },
        { name: "Serveur", value: `${data.guildName} (${data.guildId})` },
        {
          name: "Nombre d'utilisateurs bannis",
          value: data.bannedCount.toString(),
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
    await webhookClient.send({ embeds: [embed] });
    await webhookClient.destroy();
  } catch (error) {
    console.error(`Erreur lors de l'envoi du webhook "syncBans":`, error);
  }
}
