const {
  SlashCommandBuilder,
  EmbedBuilder,
  WebhookClient,
} = require("discord.js");
const { getConnection } = require("../../utils/databaseUtils");

const WEBHOOK_CHANNELS = {
  staffAdded: "1355698662864584875",
  staffRemoved: "1355843019768725587",
  staffModified: "1355843073103364116",
  staffList: "1355843325294547034",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("managestaffs")
    .setDescription("Gérer les staffs du bot")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Action à effectuer")
        .setRequired(true)
        .addChoices(
          { name: "Ajouter un staff", value: "ajouter" },
          { name: "Supprimer un staff", value: "supprimer" },
          { name: "Modifier un staff", value: "modifier" },
          { name: "Voir la liste des staffs", value: "liste" }
        )
    )
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription(
          "Utilisateur à gérer (requis pour ajouter, supprimer, modifier)"
        )
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("niveau_permission")
        .setDescription("Niveau de permission (requis pour ajouter, modifier)")
        .setRequired(false)
    ),
  async execute(interaction, client) {
    const action = interaction.options.getString("action");
    const utilisateur = interaction.options.getUser("utilisateur");
    const niveauPermission =
      interaction.options.getInteger("niveau_permission");
    let dbConnection;

    try {
      dbConnection = await getConnection();

      switch (action) {
        case "ajouter":
          if (!utilisateur || !niveauPermission) {
            return interaction.reply({
              embeds: [
                createWarningEmbed(
                  "Veuillez spécifier l'utilisateur et le niveau de permission."
                ),
              ],
            });
          }
          await ajouterStaff(
            interaction,
            dbConnection,
            utilisateur,
            niveauPermission,
            client
          );
          break;
        case "supprimer":
          if (!utilisateur) {
            return interaction.reply({
              embeds: [
                createWarningEmbed(
                  "Veuillez spécifier l'utilisateur à supprimer."
                ),
              ],
            });
          }
          await supprimerStaff(interaction, dbConnection, utilisateur, client);
          break;
        case "modifier":
          if (!utilisateur || !niveauPermission) {
            return interaction.reply({
              embeds: [
                createWarningEmbed(
                  "Veuillez spécifier l'utilisateur et le niveau de permission."
                ),
              ],
            });
          }
          await modifierStaff(
            interaction,
            dbConnection,
            utilisateur,
            niveauPermission,
            client
          );
          break;
        case "liste":
          await afficherListeStaff(interaction, dbConnection, client);
          break;
        default:
          await interaction.reply({
            embeds: [createErrorEmbed("Action invalide.")],
          });
      }
    } catch (error) {
      console.error("Erreur lors de la gestion du staff:", error);
      await interaction.reply({
        embeds: [createErrorEmbed("Une erreur est survenue.")],
      });
    } finally {
      if (dbConnection) {
        await dbConnection.end();
      }
    }
  },
};

async function ajouterStaff(
  interaction,
  dbConnection,
  utilisateur,
  niveauPermission,
  client
) {
  await dbConnection.execute(
    "INSERT INTO staff_permissions (user_id, permission_level) VALUES (?, ?) ON DUPLICATE KEY UPDATE permission_level = ?",
    [utilisateur.id, niveauPermission, niveauPermission]
  );

  const embed = new EmbedBuilder()
    .setColor("#2ECC71")
    .setDescription(
      `✅ L'utilisateur <@${utilisateur.id}> a été ajouté au staff avec le niveau de permission ${niveauPermission}.`
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

  await interaction.reply({ embeds: [embed] });

  const webhookEmbed = new EmbedBuilder()
    .setColor("#3498DB")
    .setTitle("Staff ajouté")
    .setDescription(
      `L'utilisateur <@${utilisateur.id}> a été ajouté au staff avec le niveau de permission ${niveauPermission}.`
    )
    .addFields(
      {
        name: "Utilisateur",
        value: `<@${utilisateur.id}> (${utilisateur.id})`,
      },
      { name: "Niveau de permission", value: niveauPermission.toString() },
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

  await sendWebhook(client, "staffAdded", webhookEmbed);
}

async function supprimerStaff(interaction, dbConnection, utilisateur, client) {
  await dbConnection.execute(
    "DELETE FROM staff_permissions WHERE user_id = ?",
    [utilisateur.id]
  );

  const embed = new EmbedBuilder()
    .setColor("#2ECC71")
    .setDescription(
      `✅ L'utilisateur <@${utilisateur.id}> a été supprimé du staff.`
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

  await interaction.reply({ embeds: [embed] });

  const webhookEmbed = new EmbedBuilder()
    .setColor("#E74C3C")
    .setTitle("Staff supprimé")
    .setDescription(
      `L'utilisateur <@${utilisateur.id}> a été supprimé du staff.`
    )
    .addFields(
      {
        name: "Utilisateur",
        value: `<@${utilisateur.id}> (${utilisateur.id})`,
      },
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

  await sendWebhook(client, "staffRemoved", webhookEmbed);
}

async function modifierStaff(
  interaction,
  dbConnection,
  utilisateur,
  niveauPermission,
  client
) {
  await dbConnection.execute(
    "UPDATE staff_permissions SET permission_level = ? WHERE user_id = ?",
    [niveauPermission, utilisateur.id]
  );

  const embed = new EmbedBuilder()
    .setColor("#2ECC71")
    .setDescription(
      `✅ Le niveau de permission de <@${utilisateur.id}> a été mis à jour à ${niveauPermission}.`
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

  await interaction.reply({ embeds: [embed] });

  const webhookEmbed = new EmbedBuilder()
    .setColor("#F1C40F")
    .setTitle("Staff modifié")
    .setDescription(
      `Le niveau de permission de <@${utilisateur.id}> a été mis à jour à ${niveauPermission}.`
    )
    .addFields(
      {
        name: "Utilisateur",
        value: `<@${utilisateur.id}> (${utilisateur.id})`,
      },
      {
        name: "Nouveau niveau de permission",
        value: niveauPermission.toString(),
      },
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

  await sendWebhook(client, "staffModified", webhookEmbed);
}

async function afficherListeStaff(interaction, dbConnection, client) {
  const [rows] = await dbConnection.execute(
    "SELECT user_id, permission_level FROM staff_permissions ORDER BY permission_level DESC"
  );

  if (rows.length === 0) {
    return interaction.reply({
      embeds: [createWarningEmbed("Aucun membre du staff trouvé.")],
    });
  }

  const staffList = rows
    .map((row) => `**<@${row.user_id}>** - Niveau ${row.permission_level}`)
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor("#3498DB")
    .setTitle("Liste des staffs")
    .setDescription(staffList)
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

  const webhookEmbed = new EmbedBuilder()
    .setColor("#3498DB")
    .setTitle("Liste des staffs")
    .setDescription(`Liste des staffs:\n${staffList}`)
    .addFields(
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

  await sendWebhook(client, "staffList", webhookEmbed);
}

async function sendWebhook(client, type, embed) {
  const channelId = WEBHOOK_CHANNELS[type];
  if (!channelId) return;

  try {
    const webhookClient = new WebhookClient({
      channelId: channelId,
      token: (await client.channels.fetch(channelId)).createWebhook({
        name: "Staff Logs",
      }).token,
    });
    await webhookClient.send({ embeds: [embed] });
    await webhookClient.destroy();
  } catch (error) {
    console.error(`Erreur lors de l'envoi du webhook "${type}":`, error);
  }
}

function createWarningEmbed(description) {
  return new EmbedBuilder()
    .setColor("#F1C40F")
    .setDescription(description)
    .setTimestamp()
    .setThumbnail(
      "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940"
    )
    .setFooter({
      text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
      iconURL:
        "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940",
    });
}

function createErrorEmbed(description) {
  return new EmbedBuilder()
    .setColor("#E74C3C")
    .setDescription(description)
    .setTimestamp()
    .setThumbnail(
      "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940"
    )
    .setFooter({
      text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
      iconURL:
        "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg?ex=67ea49b4&is=67e8f834&hm=eeb817dc2ca22a171ed29352aaa8c9d3469575b859c554f94a0a3062161fc5fc&=&format=webp&width=940&height=940",
    });
}
