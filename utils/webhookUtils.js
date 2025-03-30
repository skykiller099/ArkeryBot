const { EmbedBuilder, WebhookClient } = require("discord.js");

// Configuration des webhooks (à adapter selon vos besoins)
const WEBHOOK_URLS = {
  systemActivation:
    "https://discord.com/api/webhooks/1355697858203877577/wOFC0_6GSqbCfhntsh2BykrVYt3QtNsfvSODOn4qXfabbE2fKsgwZkg3Np8XFh7JnWyU",
  roleCreated:
    "https://discord.com/api/webhooks/1355951770177638542/pOfNoNbwonf30hHlYOG3B0WRV70AyV73TFdL1blK2rYOUGuIVhLxtEr59YZHfjNbyCaa",
  // Ajoutez d'autres types de webhooks si nécessaire
};

async function sendWebhookNotification(client, type, data) {
  const webhookUrl = WEBHOOK_URLS[type];
  if (!webhookUrl) {
    console.error(`Aucune URL de webhook configurée pour le type "${type}"`);
    return;
  }

  try {
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
