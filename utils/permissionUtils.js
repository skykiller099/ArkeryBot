/**
 * Utilitaire de gestion des permissions pour le panel de permissions
 */

function getPermissionsByLevel(levelNumber) {
  const permissions = [];

  if (levelNumber >= 1) {
    // Modérateur
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

  if (levelNumber >= 2) {
    // Administrateur
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

  if (levelNumber >= 3) {
    // Co-développeur
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
      }
    );
  }

  if (levelNumber >= 4) {
    // Développeur
    permissions.push({
      label: "Administrateur",
      value: "administrator",
      description: "Donne toutes les permissions d'administration du serveur.",
    });
  }

  return permissions;
}

module.exports = {
  getPermissionsByLevel,
};
