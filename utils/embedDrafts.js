const drafts = new Map();

function setDraft(userId, data) {
  drafts.set(userId, {
    title: null,
    description: null,
    image: null,
    footer: null,
    color: '#FFFFFF',
    ...data,
    lastUpdate: Date.now()
  });
}

function getDraft(userId) {
  return drafts.get(userId);
}

function updateDraft(userId, data) {
  const current = drafts.get(userId) || {
    title: null,
    description: null,
    image: null,
    footer: null,
    color: '#FFFFFF',
  };
  drafts.set(userId, { ...current, ...data, lastUpdate: Date.now() });
}

function deleteDraft(userId) {
  drafts.delete(userId);
}

// Cleanup old drafts (1 hour TTL)
setInterval(() => {
  const now = Date.now();
  for (const [userId, draft] of drafts.entries()) {
    if (now - draft.lastUpdate > 3600000) {
      drafts.delete(userId);
    }
  }
}, 600000);

module.exports = { setDraft, getDraft, updateDraft, deleteDraft };
