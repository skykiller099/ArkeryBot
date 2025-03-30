const { EmbedBuilder, WebhookClient } = require("discord.js");

// Configuration des webhooks (à adapter selon vos besoins)
const WEBHOOK_URLS = {
  systemActivation: "https://discord.com/api/webhooks/votre_id/votre_token",
  roleCreated: "https://discord.com/api/webhooks/votre_id/votre_token",
  // Vous pouvez utiliser la même URL pour tous les types ou des URLs différentes
};

/**
 * Envoie une notification via webhook
 * @param {Client} client - L'instance du client Discord
 * @param {string} type - Le type de webhook à utiliser
 * @param {Object} data - Les données pour construire l'embed
 * @param {string} data.title - Le titre de l'embed
 * @param {string} data.description - La description de l'embed
 * @param {Array} data.fields - Les champs à ajouter à l'embed
 */
async function sendWebhookNotification(client, type, data) {
  const webhookUrl = WEBHOOK_URLS[type];
  if (!webhookUrl) {
    console.error(`Aucune URL de webhook configurée pour le type "${type}"`);
    return;
  }

  try {
    // Extraction de l'ID et du token à partir de l'URL du webhook
    const urlParts = webhookUrl.split("/");
    const webhookId = urlParts[urlParts.length - 2];
    const webhookToken = urlParts[urlParts.length - 1];

    const webhookClient = new WebhookClient({
      id: webhookId,
      token: webhookToken,
    });

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle(data.title || "Notification")
      .setDescription(data.description || "")
      .setTimestamp()
      .setThumbnail(
        "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg"
      )
      .setFooter({
        text: "๖̶ζ͜͡Arkery͜͡ζ̶๖",
        iconURL:
          "https://media.discordapp.net/attachments/1355811807847121017/1355811871797805198/Arkery_logo.jpeg",
      });

    // Ajout des champs si présents
    if (data.fields && Array.isArray(data.fields)) {
      embed.addFields(data.fields);
    }

    await webhookClient.send({ embeds: [embed] });
    webhookClient.destroy();
  } catch (error) {
    console.error(`Erreur lors de l'envoi du webhook "${type}":`, error);
  }
}

module.exports = {
  sendWebhookNotification,
};
