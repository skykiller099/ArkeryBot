const { checkPermission } = require("../../utils/permissions");
const { getConnection } = require("../../utils/databaseUtils");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("copybans")
    .setDescription("Copie les bannissements d'un serveur spécifié")
    .addStringOption((option) =>
      option
        .setName("serveur_id")
        .setDescription(
          "ID du serveur dont vous souhaitez copier les bannissements"
        )
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const dbConnection = await getConnection();

    // Vérification des permissions
    if (!(await checkPermission(interaction.user.id, 2, dbConnection))) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#E74C3C")
            .setDescription(
              "Vous n'avez pas les permissions nécessaires pour utiliser cette commande."
            )
            .setTimestamp()
            .setThumbnail(
              "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940"
            )
            .setFooter({
              text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
              iconURL:
                "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940",
            }),
        ],
        ephemeral: true,
      });
    }

    const targetGuildId = interaction.options.getString("serveur_id");
    const targetGuild = client.guilds.cache.get(targetGuildId);

    // Vérification de la présence du bot sur le serveur cible
    if (!targetGuild) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#E74C3C")
            .setDescription(
              "Je ne suis pas présent sur ce serveur. Assurez-vous que l'ID est correct."
            )
            .setTimestamp()
            .setThumbnail(
              "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940"
            )
            .setFooter({
              text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
              iconURL:
                "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940",
            }),
        ],
        ephemeral: true,
      });
    }

    // Message de progression initial
    const progressMessage = await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#3498DB")
          .setDescription(
            "Récupération des bannissements en cours... (0 bannissements récupérés)"
          )
          .setTimestamp()
          .setThumbnail(
            "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940"
          )
          .setFooter({
            text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
            iconURL:
              "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940",
          }),
      ],
      fetchReply: true,
    });

    try {
      let bans = await targetGuild.bans.fetch({ limit: 1000 }); // Récupérer jusqu'à 1000 bannissements
      let allBans = bans;
      let lastId = bans.lastKey();
      let totalBans = bans.size;

      while (bans.size === 1000) {
        bans = await targetGuild.bans.fetch({ limit: 1000, after: lastId });
        allBans = allBans.concat(bans);
        lastId = bans.lastKey();
        totalBans = allBans.size;

        await progressMessage.edit({
          embeds: [
            new EmbedBuilder()
              .setColor("#3498DB")
              .setDescription(
                `Récupération des bannissements en cours... (${totalBans} bannissements récupérés)`
              )
              .setTimestamp()
              .setThumbnail(
                "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940"
              )
              .setFooter({
                text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
                iconURL:
                  "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940",
              }),
          ],
        });
      }

      totalBans = allBans.size;

      if (totalBans === 0) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("#F1C40F")
              .setDescription("Aucun bannissement trouvé sur ce serveur.")
              .setTimestamp()
              .setThumbnail(
                "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940"
              )
              .setFooter({
                text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
                iconURL:
                  "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940",
              }),
          ],
        });
      }

      let processed = 0;
      let insertions = 0;
      let duplicates = 0;
      const duplicateLogs = [];

      const insertionProgressMessage = await interaction.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#3498DB")
            .setDescription(`Progression de l'insertion: 0/${totalBans} (0%)`)
            .setTimestamp()
            .setThumbnail(
              "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940"
            )
            .setFooter({
              text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
              iconURL:
                "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940",
            }),
        ],
      });

      const batchSize = 100;
      const entries = Array.from(allBans.entries());

      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);

        for (const [userId, banInfo] of batch) {
          try {
            await dbConnection.execute(
              "INSERT IGNORE INTO banned_users (user_id, reason, banned_by) VALUES (?, ?, ?)",
              [
                userId,
                banInfo.reason || "Aucune raison fournie",
                interaction.user.id,
              ]
            );
            insertions++;
          } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
              duplicates++;
              duplicateLogs.push(userId);
            } else {
              console.error(
                `Erreur lors de l'ajout de l'utilisateur ${userId} à la base de données:`,
                err
              );
            }
          }
          processed++;
        }

        const percentage = Math.round((processed / totalBans) * 100);
        await insertionProgressMessage.edit({
          embeds: [
            new EmbedBuilder()
              .setColor("#3498DB")
              .setDescription(
                `Progression de l'insertion: ${processed}/${totalBans} (${percentage}%)`
              )
              .setTimestamp()
              .setThumbnail(
                "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940"
              )
              .setFooter({
                text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
                iconURL:
                  "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940",
              }),
          ],
        });
      }

      const successEmbed = new EmbedBuilder()
        .setColor("#2ECC71")
        .setDescription(
          `${insertions} utilisateurs ajoutés à la base de données de bannissements.`
        )
        .addFields(
          {
            name: "Serveur source",
            value: `${targetGuild.name} (${targetGuild.id})`,
          },
          { name: "Doublons ignorés", value: `${duplicates}` },
          {
            name: "Utilisateurs doublons",
            value:
              duplicateLogs.length > 0 ? duplicateLogs.join(", ") : "Aucun",
          }
        )
        .setTimestamp()
        .setThumbnail(
          "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940"
        );

      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Erreur lors de la copie des bannissements:", error);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("#E74C3C")
            .setDescription(
              "Une erreur est survenue lors de la copie des bannissements."
            )
            .setTimestamp()
            .setThumbnail(
              "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940"
            )
            .setFooter({
              text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
              iconURL:
                "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&format=webp&width=940&height=940",
            }),
        ],
      });
    }
  },
};
