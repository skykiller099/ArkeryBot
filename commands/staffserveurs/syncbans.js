const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  WebhookClient,
} = require("discord.js");
const { getConnection } = require("../../utils/databaseUtils");
const {
  checkPermission,
  PERMISSION_LEVELS,
} = require("../../utils/permissions");

const LOG_CHANNEL_ID = "1355885146410324058";
const BATCH_SIZE = 2000;

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

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        ) &&
        interaction.user.id !== interaction.guild.ownerId &&
        staffPerm < PERMISSION_LEVELS.ADMINISTRATOR
      ) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
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
              }),
          ],
          ephemeral: true,
        });
      }

      const [bannedUsers] = await dbConnection.execute(
        "SELECT user_id FROM banned_users"
      );

      if (bannedUsers.length === 0) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
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
                  "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940",
              }),
          ],
          ephemeral: true,
        });
      }

      let bannedSuccessCount = 0;
      const totalBans = bannedUsers.length;
      const bannedIds = new Set();

      const progressMessage = await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#3498DB")
            .setDescription(
              `Synchronisation des bannissements... (0/${totalBans}) 0%`
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
        fetchReply: true,
      });

      for (let i = 0; i < bannedUsers.length; i += BATCH_SIZE) {
        const batch = bannedUsers.slice(i, i + BATCH_SIZE);
        const banPromises = batch.map(async (user) => {
          const userId = user.user_id;

          if (bannedIds.has(userId)) {
            return;
          }

          bannedIds.add(userId);

          try {
            await interaction.guild.members.ban(userId, {
              reason:
                "Synchronisation des bannissements depuis la base de données.",
            });
            bannedSuccessCount++;
          } catch (error) {}
        });

        await Promise.all(banPromises);

        const percentage = Math.round(((i + BATCH_SIZE) / totalBans) * 100);

        try {
          await progressMessage.edit({
            embeds: [
              new EmbedBuilder()
                .setColor("#3498DB")
                .setDescription(
                  `Synchronisation des bannissements... (${
                    i + BATCH_SIZE
                  }/${totalBans}) ${percentage}%`
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
          console.error("Erreur lors de la modification du message :", error);
        }
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

      await sendWebhook(interaction, client, bannedSuccessCount);

      await dbConnection.end();
    } catch (error) {
      console.error(
        "Erreur lors de la synchronisation des bannissements :",
        error
      );

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
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
            }),
        ],
      });
    }
  },
};

async function sendWebhook(interaction, client, bannedSuccessCount) {
  const channel = await client.channels.fetch(LOG_CHANNEL_ID);
  if (!channel) return;

  try {
    const webhook = await channel.createWebhook({ name: "Sync Bans Logs" });
    const webhookClient = new WebhookClient({ url: webhook.url });
    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("Synchronisation des bannissements")
      .setDescription(
        "Les bannissements de la base de données ont été synchronisés avec le serveur."
      )
      .addFields(
        { name: "Exécuté par", value: `<@${interaction.user.id}>` },
        {
          name: "Serveur",
          value: `${interaction.guild.name} (${interaction.guild.id})`,
        },
        {
          name: "Nombre d'utilisateurs bannis",
          value: bannedSuccessCount.toString(),
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
    await webhook.delete();
  } catch (error) {}
}
