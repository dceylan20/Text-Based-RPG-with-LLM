-- db/schema.sql
PRAGMA foreign_keys = ON;

-- Users
CREATE TABLE IF NOT EXISTS Users (
  userId TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- GameSessions
CREATE TABLE IF NOT EXISTS GameSessions (
  sessionId TEXT PRIMARY KEY,
  userId TEXT,
  saveData TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(userId)
);

-- Classes
CREATE TABLE IF NOT EXISTS Classes (
  className TEXT PRIMARY KEY,
  baseHP INTEGER,
  baseMana INTEGER,
  baseSpeed INTEGER,
  baseDefence INTEGER,
  baseIntelligence INTEGER,
  baseDexterity INTEGER,
  baseCharisma INTEGER,
  baseWisdom INTEGER,
  baseStrength INTEGER
);

-- Players
CREATE TABLE IF NOT EXISTS Players (
  sessionId TEXT,
  nickname TEXT,
  profile_pic_path TEXT,
  class TEXT,
  lvl INTEGER,
  currentExp INTEGER,
  hp INTEGER,
  mana INTEGER,
  speed INTEGER,
  defence INTEGER,
  intelligence INTEGER,
  dexterity INTEGER,
  charisma INTEGER,
  wisdom INTEGER,
  strength INTEGER,
  inventory TEXT,
  equipment TEXT,
  PRIMARY KEY (sessionId, nickname),
  FOREIGN KEY (sessionId) REFERENCES GameSessions(sessionId),
  FOREIGN KEY (class) REFERENCES Classes(className)
);

-- Memory
CREATE TABLE IF NOT EXISTS Memory (
  orderOfMemory INTEGER,
  sessionId TEXT,
  userId TEXT,
  LLMmemory TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (orderOfMemory, userId, sessionId),
  FOREIGN KEY (userId) REFERENCES Users(userId),
  FOREIGN KEY (sessionId) REFERENCES GameSessions( sessionId)
);

-- Items
CREATE TABLE IF NOT EXISTS Items (
  itemName TEXT PRIMARY KEY,
  itemStat TEXT,
  pic_path TEXT,
  effectAmount TEXT
);

-- OwnedItems
CREATE TABLE IF NOT EXISTS OwnedItems (
  userId TEXT,
  sessionId TEXT,
  itemName TEXT,
  amount INTEGER,
  PRIMARY KEY (userId, sessionId, itemName),
  FOREIGN KEY ( sessionId) REFERENCES GameSessions( sessionId),
  FOREIGN KEY (itemName) REFERENCES Items(itemName)
);

-- Equipments
CREATE TABLE IF NOT EXISTS Equipments (
  equipmentName TEXT PRIMARY KEY,
  stat1 TEXT,
  amount1 TEXT,
  stat2 TEXT,
  amount2 TEXT,
  stat3 TEXT,
  amount3 TEXT,
  pic_path TEXT,
  durability INTEGER
);

-- OwnedEquipments
CREATE TABLE IF NOT EXISTS OwnedEquipments (
  userId TEXT,
  sessionId TEXT,
  equipmentName TEXT,
  remainedDurability Integer,
  isEquipped BOOLEAN,
  PRIMARY KEY (userId, sessionId, equipmentName),
  FOREIGN KEY (sessionId) REFERENCES GameSessions(sessionId),
  FOREIGN KEY (equipmentName) REFERENCES Equipments(equipmentName)
);

-- Skills
CREATE TABLE IF NOT EXISTS Skills (
  skillName TEXT PRIMARY KEY,
  skillStat TEXT,
  effectAmount INTEGER,
  manaCost INTEGER,
  cooldown INTEGER,
  skillLevel INTEGER,
  availableClass1 TEXT,
  availableClass2 TEXT,
  usedEnemy BOOLEAN,
  usedSelf BOOLEAN,
  usedFriend BOOLEAN,
  pic_path TEXT,
  description TEXT
);

-- OwnedSkills
CREATE TABLE IF NOT EXISTS OwnedSkills (
  userId TEXT,
  sessionId TEXT,
  skillName TEXT,
  PRIMARY KEY (userId, sessionId, skillName),
  FOREIGN KEY ( sessionId) REFERENCES GameSessions( sessionId),
  FOREIGN KEY (skillName) REFERENCES Skills(skillName)
);
