const rosterBody = document.querySelector('#roster-body');
const rosterStatus = document.querySelector('#roster-status');
const memberCount = document.querySelector('#member-count');
const classBreakdown = document.querySelector('#class-breakdown');
const searchInput = document.querySelector('#roster-search');
const classFilter = document.querySelector('#class-filter');
const roleFilter = document.querySelector('#role-filter');
const typeFilter = document.querySelector('#type-filter');
const roles = ['Tank', 'Healer', 'DPS'];
const characterTypes = ['Main', 'Alt'];

function validateRoster(data) {
  if (!Array.isArray(data)) {
    throw new Error('Il contenuto di roster.json deve essere una lista di membri.');
  }

  data.forEach((member, index) => {
    const requiredFields = ['player', 'role', 'class', 'race', 'spec', 'type'];
    if (!member || requiredFields.some((field) => typeof member[field] !== 'string' || !member[field].trim())) {
      throw new Error(`Il membro alla riga ${index + 1} deve avere player, role, class, race, spec e type valorizzati.`);
    }
    if (!roles.includes(member.role)) {
      throw new Error(`Il ruolo "${member.role}" del membro ${member.player} non è valido. Usa Tank, Healer oppure DPS.`);
    }
    if (!characterTypes.includes(member.type)) {
      throw new Error(`Il tipo "${member.type}" del personaggio ${member.player} non è valido. Usa Main oppure Alt.`);
    }
  });

  return data;
}

function normalized(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('it');
}

function getVisibleMembers(roster) {
  const query = normalized(searchInput.value.trim());
  const selectedClass = classFilter.value;
  const selectedRole = roleFilter.value;
  const selectedType = typeFilter.value;

  return roster.filter((member) => {
    const matchesQuery = !query || [member.player, member.role, member.class, member.race, member.spec, member.type]
      .some((value) => normalized(value).includes(query));
    return matchesQuery
      && (!selectedClass || member.class === selectedClass)
      && (!selectedRole || member.role === selectedRole)
      && (!selectedType || member.type === selectedType);
  });
}

function createCell(text, className) {
  const cell = document.createElement('td');
  cell.textContent = text;
  if (className) cell.className = className;
  return cell;
}

function updateClassBreakdown(members) {
  classBreakdown.replaceChildren();
  const counts = new Map();
  members.forEach(({ class: className }) => counts.set(className, (counts.get(className) || 0) + 1));
  if (!counts.size) {
    const empty = document.createElement('p');
    empty.className = 'class-breakdown-empty';
    empty.textContent = 'Le statistiche per classe appariranno quando il roster sarà popolato.';
    classBreakdown.append(empty);
    return;
  }
  const maximum = Math.max(1, ...counts.values());

  [...counts.entries()]
    .sort(([classA], [classB]) => classA.localeCompare(classB, 'it'))
    .forEach(([className, count]) => {
      const item = document.createElement('div');
      item.className = 'class-breakdown-item';
      const label = document.createElement('div');
      label.className = 'class-breakdown-label';
      const name = document.createElement('span');
      name.textContent = className;
      const total = document.createElement('strong');
      total.textContent = String(count);
      const track = document.createElement('div');
      track.className = 'class-breakdown-track';
      track.setAttribute('aria-hidden', 'true');
      const bar = document.createElement('span');
      bar.style.width = `${(count / maximum) * 100}%`;
      track.append(bar);
      label.append(name, total);
      item.append(label, track);
      classBreakdown.append(item);
    });
}

function renderRoster(roster) {
  const visibleMembers = getVisibleMembers(roster);
  rosterBody.replaceChildren();
  memberCount.textContent = String(roster.length);

  roles.forEach((role) => {
    const count = roster.filter((member) => member.role === role).length;
    const countId = { Tank: 'tank-count', Healer: 'healer-count', DPS: 'dps-count' }[role];
    document.querySelector(`#${countId}`).textContent = String(count);
  });

  updateClassBreakdown(roster);
  visibleMembers
    .slice()
    .sort((memberA, memberB) => memberA.player.localeCompare(memberB.player, 'it'))
    .forEach((member) => {
      const row = document.createElement('tr');
      row.append(
        createCell(member.player, 'roster-player'),
        createCell(member.type, 'roster-type'),
        createCell(member.role, 'roster-role'),
        createCell(member.class),
        createCell(member.race),
        createCell(member.spec),
      );
      rosterBody.append(row);
    });

  if (!roster.length) {
    rosterStatus.textContent = 'Il roster non contiene ancora membri. Quando aggiungerai i dati a roster.json, appariranno qui.';
  } else if (!visibleMembers.length) {
    rosterStatus.textContent = 'Nessun membro corrisponde ai filtri selezionati.';
  } else {
    rosterStatus.textContent = `Visualizzati ${visibleMembers.length} membri su ${roster.length}.`;
  }
}

async function initializeRoster() {
  try {
    const response = await fetch('roster.json');
    if (!response.ok) {
      throw new Error(`Impossibile caricare roster.json (HTTP ${response.status}).`);
    }
    const roster = validateRoster(await response.json());
    searchInput.addEventListener('input', () => renderRoster(roster));
    classFilter.addEventListener('change', () => renderRoster(roster));
    roleFilter.addEventListener('change', () => renderRoster(roster));
    typeFilter.addEventListener('change', () => renderRoster(roster));
    renderRoster(roster);
  } catch (error) {
    rosterStatus.textContent = `Errore nel caricamento del roster: ${error.message}`;
  }
}

initializeRoster();
