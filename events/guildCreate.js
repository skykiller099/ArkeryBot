const { EmbedBuilder, WebhookClient } = require("discord.js");

const WEBHOOK_CHANNELS = {
  botAdded: "1355700338215689236",
};

module.exports = {
  name: "guildCreate",
  async execute(guild, client) {
    let adder = null;

    try {
      const auditLogs = await guild.fetchAuditLogs({
        type: "BotAdd",
        limit: 1,
      });
      adder = auditLogs.entries.first().executor;

      if (adder) {
        await adder.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#3498DB")
              .setTitle("Bienvenue sur votre serveur !")
              .setDescription(
                "Merci d'avoir ajouté le bot à votre serveur !\n\nVoici quelques étapes pour configurer le bot :\n\n- Configurez l'autoban avec `/enableautoban` et `/disableautoban`.\n\n\n> - **Important :** *Si vous possèdez des bot de protection , merci de me whitelist afin que je ne sois pas `kick` ou `ban` , car en effet , en raison de la synchronisation des utilisateurs bannis , un grand nombre de bannissements vont être effectués sur votre serveur !*\n> - **Utilisez** `/syncbans` **pour bannir tout les membres néfaste à votre serveur contenus dans notre base de donnée !**\n\n- Utilisez `/help` pour voir toutes les commandes !\n\nN'hésitez pas à consulter la documentation pour plus d'informations."
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
      } else {
        console.error(
          "Impossible de trouver l'utilisateur qui a ajouté le bot au serveur :",
          guild.id
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des logs d'audit ou de l'envoi du MP :",
        error
      );
    }

    let channel = guild.systemChannel;

    if (!channel) {
      channel = guild.channels.cache.find(
        (ch) =>
          ch.name === "general" ||
          ch.name === "discussion" ||
          ch.name === "chat"
      );
    }

    if (
      channel &&
      channel.permissionsFor(guild.members.me).has("SendMessages")
    ) {
      channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#2ECC71")
            .setTitle("Bot ajouté au serveur !")
            .setDescription(
              "Le bot a été ajouté avec succès à ce serveur. Veuillez configurer les paramètres nécessaires."
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
    } else {
      console.error(
        "Impossible de trouver un salon approprié pour envoyer un message sur le serveur :",
        guild.id
      );
    }

    const webhookEmbed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("Bot ajouté à un serveur")
      .setDescription("Le bot a été ajouté à un nouveau serveur.")
      .addFields(
        { name: "Nom du serveur", value: guild.name },
        { name: "ID du serveur", value: guild.id },
        {
          name: "Propriétaire du serveur",
          value: `<@${guild.ownerId}> (${guild.ownerId})`,
        },
        {
          name: "Ajouté par",
          value: adder ? `<@${adder.id}> (${adder.id})` : "Non trouvé",
        },
        { name: "Nombre de membres", value: guild.memberCount.toString() },
        { name: "ID du bot", value: client.user.id },
        { name: "Nom du bot", value: client.user.tag }
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

    await sendWebhook(client, "botAdded", webhookEmbed);
  },
};

async function sendWebhook(client, type, embed) {
  const channelId = WEBHOOK_CHANNELS[type];
  if (!channelId) return;

  try {
    const webhookClient = new WebhookClient({
      channelId: channelId,
      token: (await client.channels.fetch(channelId)).createWebhook({
        name: "Bot Logs",
      }).token,
    });
    await webhookClient.send({ embeds: [embed] });
    await webhookClient.destroy();
  } catch (error) {
    console.error(`Erreur lors de l'envoi du webhook "${type}":`, error);
  }
}
