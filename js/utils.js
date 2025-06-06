// ************ Le softcaps >;D ************
function applyPolynomialSoftcap(number, threshold, strength = new Decimal(2)) {
	number = new Decimal(number)
	threshold = new Decimal(threshold)
	strength = new Decimal(strength)
	if (number.lt(threshold)) return number
	return number.mul(threshold.pow(strength.sub(1))).root(strength)
}

function applyLogapolynomialSoftcap(number, threshold, strength = new Decimal(2)) {
	number = new Decimal(number)
	threshold = new Decimal(threshold)
	strength = new Decimal(strength)
	return number.gte(threshold) ? Decimal.pow(10, number.add(1).log(10).mul(threshold.add(1).log(10).pow(strength.sub(1))).root(strength)).sub(1) : number
}


function randomBetween(a, b) {
	a = new Decimal(a); b = new Decimal(b)
	return new Decimal(Math.random()).add(a).mul(b.sub(a))
}

function randomLogBetween(a, b) {
	return Decimal.pow(10, randomBetween(a.log10(), b.log10()))
}

function simulateStock(target, min, max, mag) {
	const between = (min + max) / 2
	const price = player.skaia[target + "Price"] = player.skaia[target + "Price"].add(player.skaia[target + "Speed"]).min(max).max(min)
	const speed = player.skaia[target + "Speed"] = player.skaia[target + "Speed"].add(randomBetween(Decimal.sub(price, min).mul(mag), Decimal.sub(max, price).mul(mag)))
	return price + ' ' + speed
}

// ************ Colors, for stuff ************

function brightness(hex){
    // strip the leading # if it's there
    hex = hex.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if(hex.length == 3){
        hex = hex.replace(/(.)/g, '$1$1');
    }

    var r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16);
		
	return Math.round(((parseInt(r) * 299) + (parseInt(g) * 587) + (parseInt(b) * 114)) / 1000);
}
function lighten(hex){
	if (hex == "#000000" || hex == "#000") return "#ffffff"

    hex = hex.replace(/^\s*#|\s*$/g, '');
    if(hex.length == 3){
        hex = hex.replace(/(.)/g, '$1$1');
    }

    var r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16);
		
	var lum = Math.round(((parseInt(r) * 299) + (parseInt(g) * 587) + (parseInt(b) * 114)) / 1000);

	var percent = Math.max(100 - lum, 0);

    return '#' +
       ((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
       ((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
       ((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}

// ************ Big Feature related ************

function respecBuyables(layer) {
	if (!layers[layer].buyables) return
	if (!layers[layer].buyables.respec) return
	if (!player[layer].noRespecConfirm && !confirm(tmp[layer].buyables.respecMessage || "Are you sure you want to respec? This will force you to do a \"" + (tmp[layer].name ? tmp[layer].name : layer) + "\" reset as well!")) return
	run(layers[layer].buyables.respec, layers[layer].buyables)
	updateBuyableTemp(layer)
	document.activeElement.blur()
}

function canAffordUpgrade(layer, id) {
	let upg = tmp[layer].upgrades[id]
	if (tmp[layer].upgrades[id].canAfford !== undefined) return tmp[layer].upgrades[id].canAfford
	let cost = tmp[layer].upgrades[id].cost
	return canAffordPurchase(layer, upg, cost)
}

function canBuyBuyable(layer, id) {
	let b = temp[layer].buyables[id]
	return (b.unlocked && b.canAfford && player[layer].buyables[id].lt(b.purchaseLimit))
}

function hasUpgrade(layer, id) {
	return (player[layer].upgrades.includes(toNumber(id)) || player[layer].upgrades.includes(id.toString()))
}

function hasMilestone(layer, id) {
	return (player[layer].milestones.includes(toNumber(id)) || player[layer].milestones.includes(id.toString()))
}

function hasAchievement(layer, id) {
	return (player[layer].achievements.includes(toNumber(id)) || player[layer].achievements.includes(id.toString()))
}

function hasChallenge(layer, id) {
	return (player[layer].challenges[id])
}

function maxedChallenge(layer, id) {
	return (player[layer].challenges[id] >= tmp[layer].challenges[id].completionLimit)
}

function challengeCompletions(layer, id) {
	return (player[layer].challenges[id])
}

function getBuyableAmount(layer, id) {
	return (player[layer].buyables[id])
}

function setBuyableAmount(layer, id, amt) {
	player[layer].buyables[id] = amt
}

function getClickableState(layer, id) {
	return (player[layer].clickables[id])
}

function setClickableState(layer, id, state) {
	player[layer].clickables[id] = state
}

function upgradeEffect(layer, id) {
	return (tmp[layer].upgrades[id].effect)
}

function challengeEffect(layer, id) {
	return (tmp[layer].challenges[id].rewardEffect)
}

function buyableEffect(layer, id) {
	return (tmp[layer].buyables[id].effect)
}

function clickableEffect(layer, id) {
	return (tmp[layer].clickables[id].effect)
}

function achievementEffect(layer, id) {
	return (tmp[layer].achievements[id].effect)
}

function canAffordPurchase(layer, thing, cost) {

	if (thing.currencyInternalName) {
		let name = thing.currencyInternalName
		if (thing.currencyLocation) {
			return !(thing.currencyLocation[name].lt(cost))
		}
		else if (thing.currencyLayer) {
			let lr = thing.currencyLayer
			return !(player[lr][name].lt(cost))
		}
		else {
			return !(player[name].lt(cost))
		}
	}
	else {
		return !(player[layer].points.lt(cost))
	}
}

function buyUpgrade(layer, id) {
	buyUpg(layer, id)
}

function buyUpg(layer, id) {
	if (!tmp[layer].upgrades || !tmp[layer].upgrades[id]) return
	let upg = tmp[layer].upgrades[id]
	if (!player[layer].unlocked) return
	if (!tmp[layer].upgrades[id].unlocked) return
	if (player[layer].upgrades.includes(id)) return
	if (upg.canAfford === false) return
	let pay = layers[layer].upgrades[id].pay
	if (pay !== undefined)
		run(pay, layers[layer].upgrades[id])
	else {
		let cost = tmp[layer].upgrades[id].cost

		if (upg.currencyInternalName) {
			let name = upg.currencyInternalName
			if (upg.currencyLocation) {
				if (upg.currencyLocation[name].lt(cost)) return
				upg.currencyLocation[name] = upg.currencyLocation[name].sub(cost)
			}
			else if (upg.currencyLayer) {
				let lr = upg.currencyLayer
				if (player[lr][name].lt(cost)) return
				player[lr][name] = player[lr][name].sub(cost)
			}
			else {
				if (player[name].lt(cost)) return
				player[name] = player[name].sub(cost)
			}
		}
		else {
			if (player[layer].points.lt(cost)) return
			player[layer].points = player[layer].points.sub(cost)
		}
	}
	player[layer].upgrades.push(id);
	if (upg.onPurchase != undefined)
		run(upg.onPurchase, upg)
}

function buyMaxBuyable(layer, id) {
	if (!player[layer].unlocked) return
	if (!tmp[layer].buyables[id].unlocked) return
	if (!tmp[layer].buyables[id].canAfford) return
	if (!layers[layer].buyables[id].buyMax) return

	run(layers[layer].buyables[id].buyMax, layers[layer].buyables[id])
	updateBuyableTemp(layer)
}

function buyBuyable(layer, id) {
	if (!player[layer].unlocked) return
	if (!tmp[layer].buyables[id].unlocked) return
	if (!tmp[layer].buyables[id].canBuy) return

	run(layers[layer].buyables[id].buy, layers[layer].buyables[id])
	updateBuyableTemp(layer)
}

function clickClickable(layer, id) {
	if (!player[layer].unlocked) return
	if (!tmp[layer].clickables[id].unlocked) return
	if (!tmp[layer].clickables[id].canClick) return

	run(layers[layer].clickables[id].onClick, layers[layer].clickables[id])
	updateClickableTemp(layer)
}

// Function to determine if the player is in a challenge
function inChallenge(layer, id) {
	let challenge = player[layer].activeChallenge
	if (!challenge) return false
	id = toNumber(id)
	if (challenge == id) return true

	if (layers[layer].challenges[challenge].countsAs)
		return tmp[layer].challenges[challenge].countsAs.includes(id)
}

// ************ Story ************

function startStoryPage(layer, page) {
	player[layer].story.page = page;
}

function MSPFAToStory(data) {
	if (typeof data == "string") data = JSON.parse(data.replace("\n", "\\n"))
	var story = {};
	for (index in data) {
		story[+index+1] = {
			content: `<h1>${data[index].c}</h1><br/><br/>${applyBBCode(data[index].b)}`,
			commands: data[index].n.map(page => {return {
				page: page,
				title: data[page-1] ? data[page-1].c : ""
			}})
		}
	}
	return story;
}

function applyBBCode(string) {
	var bbcode = [
		[/  /g, "&nbsp;&nbsp;"],
		[/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;"],
		[/\r?\n/g, "<br>"],
		[/\[b\]((?:(?!\[b\]).)*?)\[\/b\]/gi, "<span style=\"font-weight: bolder;\">$1</span>"],
		[/\[i\]((?:(?!\[i\]).)*?)\[\/i\]/gi, "<span style=\"font-style: italic;\">$1</span>"],
		[/\[u\]((?:(?!\[u\]).)*?)\[\/u\]/gi, "<span style=\"text-decoration: underline;\">$1</span>"],
		[/\[s\]((?:(?!\[s\]).)*?)\[\/s\]/gi, "<span style=\"text-decoration: line-through;\">$1</span>"],
		[/\[size=(\d*?)\]((?:(?!\[size=(?:\d*?)\]).)*?)\[\/size\]/gi, "<span style=\"font-size: $1px;\">$2</span>"],
		[/\[color=("?)#?([a-f0-9]{3}(?:[a-f0-9]{3})?)\1\]((?:(?!\[color(?:=[^;]*?)\]).)*?)\[\/color\]/gi, "<span style=\"color: #$2;\">$3</span>"],
		[/\[color=("?)([^";]+?)\1\]((?:(?!\[color(?:=[^;]*?)\]).)*?)\[\/color\]/gi, "<span style=\"color: $2;\">$3</span>"],
		[/\[background=("?)#?([a-f0-9]{3}(?:[a-f0-9]{3})?)\1\]((?:(?!\[background(?:=[^;]*?)\]).)*?)\[\/background\]/gi, "<span style=\"background-color: #$2;\">$3</span>"],
		[/\[background=("?)([^";]+?)\1\]((?:(?!\[background(?:=[^;]*?)\]).)*?)\[\/background\]/gi, "<span style=\"background-color: $2;\">$3</span>"],
		[/\[font=("?)([^";]*?)\1\]((?:(?!\[size(?:=[^;]*?)\]).)*?)\[\/font\]/gi, "<span style=\"font-family: $2;\">$3</span>"],
		[/\[(center|left|right|justify)\]((?:(?!\[\1\]).)*?)\[\/\1\]/gi, "<div style=\"text-align: $1;\">$2</div>"],
		[/\[url\]([^"]*?)\[\/url\]/gi, "<a href=\"$1\">$1</a>"],
		[/\[url=("?)([^"]*?)\1\]((?:(?!\[url(?:=.*?)\]).)*?)\[\/url\]/gi, "<a href=\"$2\">$3</a>"],
		[/\[alt=("?)([^"]*?)\1\]((?:(?!\[alt(?:=.*?)\]).)*?)\[\/alt\]/gi, "<span title=\"$2\">$3</span>"],
		[/\[img\]([^"]*?)\[\/img\]/gi, "<img src=\"$1\">"],
		[/\[img=(\d*?)x(\d*?)\]([^"]*?)\[\/img\]/gi, "<img src=\"$3\" width=\"$1\" height=\"$2\">"],
		[/\[spoiler\]((?:(?!\[spoiler(?: .*?)?\]).)*?)\[\/spoiler\]/gi, "<div class=\"spoiler closed\"><div style=\"text-align: center;\"><input type=\"button\" value=\"Show\" data-close=\"Hide\" data-open=\"Show\"></div><div>$1</div></div>"],
		[/\[spoiler open=("?)([^"]*?)\1 close=("?)([^"]*?)\3\]((?:(?!\[spoiler(?: .*?)?\]).)*?)\[\/spoiler\]/gi, "<div class=\"spoiler closed\"><div style=\"text-align: center;\"><input type=\"button\" value=\"$2\" data-open=\"$2\" data-close=\"$4\"></div><div>$5</div></div>"],
		[/\[spoiler close=("?)([^"]*?)\1 open=("?)([^"]*?)\3\]((?:(?!\[spoiler(?: .*?)?\]).)*?)\[\/spoiler\]/gi, "<div class=\"spoiler closed\"><div style=\"text-align: center;\"><input type=\"button\" value=\"$4\" data-open=\"$4\" data-close=\"$2\"></div><div>$5</div></div>"],
		[/\[flash=(\d*?)x(\d*?)\](.*?)\[\/flash\]/gi, "<object type=\"application/x-shockwave-flash\" data=\"$3\" width=\"$1\" height=\"$2\"></object>"],
		[/\[user\](.+?)\[\/user\]/gi, "<a class=\"usertag\" href=\"/user/?u=$1\" data-userid=\"$1\">@...</a>"]
	]

	for (bbc of bbcode) {
		string = string.replace(bbc[0], bbc[1])
	}
	return string;
}

// ************ Misc ************

var onTreeTab = true
function showTab(name) {
	if (LAYERS.includes(name) && !layerunlocked(name)) return
	if (player.tab === name && isPlainObject(tmp[name].tabFormat)) {
		player.subtabs[name].mainTabs = Object.keys(layers[name].tabFormat)[0]
	}
	var toTreeTab = name == "none"
	player.tab = name
	if (player.navTab == "none" && (tmp[name].row !== "side") && (tmp[name].row !== "otherside")) player.lastSafeTab = name
	delete player.notify[name]
	needCanvasUpdate = true
	document.activeElement.blur()
}

function showNavTab(name) {
	if (LAYERS.includes(name) && !layerunlocked(name)) return

	var toTreeTab = name == "tree"
	player.navTab = name
	player.notify[name] = false
	needCanvasUpdate = true
}


function goBack() {
	if (player.navTab !== "none") showTab("none")
	else showTab(player.lastSafeTab)
}

function layOver(obj1, obj2) {
	for (let x in obj2) {
		if (obj2[x] instanceof Decimal) obj1[x] = new Decimal(obj2[x])
		else if (obj2[x] instanceof Object) layOver(obj1[x], obj2[x]);
		else obj1[x] = obj2[x];
	}
}

function prestigeNotify(layer) {
	if (layers[layer].prestigeNotify) return layers[layer].prestigeNotify()
	
	if (isPlainObject(tmp[layer].tabFormat)) {
		for (subtab in tmp[layer].tabFormat){
			if (subtabResetNotify(layer, 'mainTabs', subtab))
				return true
		}
	}
	for (family in tmp[layer].microtabs) {
		for (subtab in tmp[layer].microtabs[family]){
			if (subtabResetNotify(layer, family, subtab))
				return true
		}
	}
	if (tmp[layer].autoPrestige || tmp[layer].passiveGeneration) return false
	else if (tmp[layer].type == "static") return tmp[layer].canReset
	else if (tmp[layer].type == "normal") return (tmp[layer].canReset && (tmp[layer].resetGain.gte(player[layer].points.div(10))))
	else return false
}

function notifyLayer(name) {
	if (player.tab == name || !layerunlocked(name)) return
	player.notify[name] = 1
}

function subtabShouldNotify(layer, family, id) {
	let subtab = {}
	if (family == "mainTabs") subtab = tmp[layer].tabFormat[id]
	else subtab = tmp[layer].microtabs[family][id]

	if (subtab.embedLayer) return tmp[subtab.embedLayer].notify
	else return subtab.shouldNotify
}

function subtabResetNotify(layer, family, id) {
	let subtab = {}
	if (family == "mainTabs") subtab = tmp[layer].tabFormat[id]
	else subtab = tmp[layer].microtabs[family][id]
	if (subtab.embedLayer) return tmp[subtab.embedLayer].prestigeNotify
	else return subtab.prestigeNotify
}

function nodeShown(layer) {
	if (layerShown(layer)) return true
	switch (layer) {
		case "idk":
			return player.idk.unlocked
			break;
	}
	return false
}

function layerunlocked(layer) {
	if (tmp[layer] && tmp[layer].type == "none") return (player[layer].unlocked)
	return LAYERS.includes(layer) && (player[layer].unlocked || (tmp[layer].canReset && tmp[layer].layerShown))
}

function keepGoing() {
	player.keepGoing = true;
	needCanvasUpdate = true;
	goBack()
}

function toNumber(x) {
	if (x.mag !== undefined) return x.toNumber()
	if (x + 0 !== x) return parseFloat(x)
	return x
}

function updateMilestones(layer) {
	for (id in layers[layer].milestones) {
		if (!(hasMilestone(layer, id)) && layers[layer].milestones[id].done()) {
			player[layer].milestones.push(id)
			if (tmp[layer].milestonePopups || tmp[layer].milestonePopups === undefined) doPopup("milestone", tmp[layer].milestones[id].requirementDescription, "Milestone Gotten!", 3, tmp[layer].color);
			player[layer].lastMilestone = id
		}
	}
}

function updateAchievements(layer) {
	for (id in layers[layer].achievements) {
		if (isPlainObject(layers[layer].achievements[id]) && !(hasAchievement(layer, id)) && layers[layer].achievements[id].done()) {
			player[layer].achievements.push(id)
			if (layers[layer].achievements[id].onComplete) layers[layer].achievements[id].onComplete()
			if (tmp[layer].achievementPopups || tmp[layer].achievementPopups === undefined) doPopup("achievement", tmp[layer].achievements[id].name, "Achievement Gotten!", 3, tmp[layer].color);
		}
	}
}

function addTime(diff, layer) {
	let data = player
	let time = data.timePlayed
	if (layer) {
		data = data[layer]
		time = data.time
	}

	//I am not that good to perfectly fix that leak. ~ DB Aarex
	if (time + 0 !== time) {
		console.log("Memory leak detected. Trying to fix...")
		time = toNumber(time)
		if (isNaN(time) || time == 0) {
			console.log("Couldn't fix! Resetting...")
			time = layer ? player.timePlayed : 0
			if (!layer) player.timePlayedReset = true
		}
	}
	time += toNumber(diff)

	if (layer) data.time = time
	else data.timePlayed = time
}

shiftDown = false
ctrlDown = false

document.onkeydown = function (e) {
	if (player === undefined) return;
	if (gameEnded && !player.keepGoing) return;
	shiftDown = e.shiftKey
	ctrlDown = e.ctrlKey
	let key = e.key
	if (ctrlDown) key = "ctrl+" + key
	if (onFocused) return
	if (ctrlDown && hotkeys[key]) e.preventDefault()
	if (hotkeys[key]) {
		let k = hotkeys[key]
		if (player[k.layer].unlocked && tmp[k.layer].hotkeys[k.id].unlocked)
			k.onPress()
	}
}

document.onkeyup = function (e) {
	shiftDown = e.shiftKey
	ctrlDown = e.ctrlKey
}

var onFocused = false
function focused(x) {
	onFocused = x
}


function isFunction(obj) {
	return !!(obj && obj.constructor && obj.call && obj.apply);
};

function isPlainObject(obj) {
	return (!!obj) && (obj.constructor === Object)
}

if (window.location.hostname == "cc.bingj.com") {
	document.body.removeChild(document.getElementsByClassName("banner")[0])
	document.title = "The Prestreestuck, but you're playing it on Bing's cache"
} else if (Math.random() < 0.1) {
	let titles = [
		"The Prestreestuck",
		"The Preestuck",
		"MS-Paint (Fan) Incremental",
		"Layer Omega",
		"Vast Numbers",
		"Number Sleuth",
		"Limitbreak",
		"cool and new idle game",
		"sweet magnitude and hella layer",
		"The Retcon Tree",
		"Treeswap",
		"Number Increasing Simulator",
		"The Candy Tab",
		"I need some art",
		"Act 1.798e308",
		"3 years until the update",
		"Number Prologue...?",
		"{Number, 2}: Beyond Googology",
		VERSION.name,
	]
	document.title = titles[Math.floor(Math.random() * titles.length)] + " - " + document.title
}

// Converts a string value to whatever it's supposed to be
function toValue(value, oldValue) {
	if (oldValue instanceof Decimal)
		return new Decimal (value)
	else if (!isNaN(oldValue))
		return value.toNumber()
	else return value
}

// Variables that must be defined to display popups
var activePopups = [];
var popupID = 0;

// Function to show popups
function doPopup(type = "none", text = "This is a test popup.", title = null, timer = 3, color = "") {
	switch (type) {
		case "achievement":
			popupTitle = "Achievement Unlocked!";
			popupType = "achievement-popup"
			break;
		case "challenge":
			popupTitle = "Challenge Complete";
			popupType = "challenge-popup"
			break;
		default:
			popupTitle = "Something Happened?";
			popupType = "default-popup"
			break;
	}
	if (title !== null) popupTitle = title;
	popupMessage = text;
	popupTimer = timer;

	activePopups.unshift({ "time": popupTimer, "type": popupType, "title": popupTitle, "message": (popupMessage + "\n"), "id": popupID, "color": color })
	popupID++;
}


//Function to reduce time on active popups
function adjustPopupTime(diff) {
	for (popup in activePopups) {
		activePopups[popup].time -= diff;
		if (activePopups[popup]["time"] < 0) {
			activePopups.splice(popup, 1); // Remove popup when time hits 0
		}
	}
}

function run(func, target, args = null) {
	if (!!(func && func.constructor && func.call && func.apply)) {
		let bound = func.bind(target)
		return bound(args)
	}
	else
		return func;
}