// DOM Elements yang digunakan dari HTML
const passwordInput = document.getElementById("password");
const lengthDisplay = document.getElementById("length-value");
const uppercaseCheck = document.getElementById("uppercase");
const lowercaseCheck = document.getElementById("lowercase");
const numbersCheck = document.getElementById("numbers");
const symbolsCheck = document.getElementById("symbols");
const easyReadCheck = document.getElementById("easy-read");
const pronounceableCheck = document.getElementById("pronounceable");
const copyButton = document.getElementById("copy-btn");
const strengthLabel = document.getElementById("strength-value");
const strengthText = document.querySelector(".strength-text");
const strengthBar = document.querySelector(".strength-bar");

// set character sets untuk password
const characterSets = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+[]{}|;:',.<>?/~`"
};

// Easy-to-read character sets (menghindari karakter yang membingungkan)
const easyReadCharacterSets = {
    uppercase: "ABCDEFGHJKMNPQRSTUVWXYZ", // Menghilangkan I, L, O
    lowercase: "abcdefghjkmnpqrstuvwxyz", // Menghilangkan i, l, o
    numbers: "23456789", // Menghilangkan 0, 1
    symbols: "!@#$%^&*+-=?" // Hanya simbol yang jelas dan mudah dibaca
};

// Pronounceable syllable patterns untuk password yang mudah diucapkan
const pronounceableSyllables = {
    consonants: ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "x", "z"],
    vowels: ["a", "e", "i", "o", "u"],
    consonantClusters: ["bl", "br", "ch", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "pl", "pr", "sk", "sl", "sm", "sn", "sp", "st", "sw", "th", "tr", "tw"],
    suffixes: ["er", "ed", "ing", "ly", "ty", "ry", "ny"],
    prefixes: ["un", "re", "in", "de", "pre", "pro", "con"]
};

const lengthSlider = document.getElementById("length");
// event listener untuk tombol length slider
lengthSlider.addEventListener("input", () => {
    lengthDisplay.textContent = lengthSlider.value;
});

const generateButton = document.getElementById("generate-btn");
// event listener untuk tombol generate
generateButton.addEventListener("click", passwordMaker);

// Event listener untuk auto-generate saat opsi berubah
[uppercaseCheck, lowercaseCheck, numbersCheck, symbolsCheck, easyReadCheck, pronounceableCheck].forEach(checkbox => {
    checkbox.addEventListener('change', passwordMaker);
});

// Event listener khusus untuk pronounceable checkbox
pronounceableCheck.addEventListener('change', function() {
    const lowercaseOption = lowercaseCheck.closest('.option');
    
    if (this.checked) {
        // Ketika pronounceable diaktifkan, matikan lowercase karena sudah otomatis
        lowercaseCheck.checked = false;
        lowercaseCheck.disabled = true;
        if (lowercaseOption) {
            lowercaseOption.style.opacity = '0.6';
        }
        
        // Beri notifikasi
        showNotification('Pronounceable mode: Creates easy-to-say passwords!');
    } else {
        // Ketika pronounceable dimatikan, aktifkan kembali lowercase
        lowercaseCheck.disabled = false;
        lowercaseCheck.checked = true;
        if (lowercaseOption) {
            lowercaseOption.style.opacity = '1';
        }
    }
    passwordMaker();
});

// fungsi untuk membuat password
function passwordMaker() {
    const length = parseInt(lengthSlider.value);
    const includeUppercase = uppercaseCheck.checked;
    const includeLowercase = lowercaseCheck.checked;
    const includeNumbers = numbersCheck.checked;
    const includeSymbols = symbolsCheck.checked;
    const easyToRead = easyReadCheck.checked;
    const pronounceable = pronounceableCheck.checked;
    
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols && !pronounceable) {
        alert("Please select at least one character type or pronounceable option.");
        return;
    }

    let newPassword;
    
    if (pronounceable) {
        newPassword = createPronounceablePassword(length, includeNumbers, includeSymbols, includeUppercase);
    } else {
        newPassword = createRandomPassword(
            length, 
            includeUppercase, 
            includeLowercase, 
            includeNumbers, 
            includeSymbols,
            easyToRead
        );
    }

    passwordInput.value = newPassword;
    updateStrength(newPassword);
    addToHistory(newPassword); // Add to history
}

function createRandomPassword(
    length, 
    includeUppercase, 
    includeLowercase, 
    includeNumbers, 
    includeSymbols,
    easyToRead = false
) {
    let characterPool = "";
    
    // Pilih character set berdasarkan opsi easy-to-read
    const charSets = easyToRead ? easyReadCharacterSets : characterSets;

    if (includeUppercase) characterPool += charSets.uppercase;
    if (includeLowercase) characterPool += charSets.lowercase;
    if (includeNumbers) characterPool += charSets.numbers;
    if (includeSymbols) characterPool += charSets.symbols;

    let password = "";

    for(let i  = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characterPool.length);
        password += characterPool[randomIndex];
    }

    return password;
}

// Fungsi untuk membuat pronounceable password
function createPronounceablePassword(length, includeNumbers = false, includeSymbols = false, includeUppercase = false) {
    let password = "";
    let currentLength = 0;
    
    while (currentLength < length) {
        // Pilih jenis suku kata secara acak
        const syllableType = Math.random();
        let syllable = "";
        
        if (syllableType < 0.3) {
            // Consonant + Vowel pattern (ba, te, ki, etc.)
            const consonant = getRandomElement(pronounceableSyllables.consonants);
            const vowel = getRandomElement(pronounceableSyllables.vowels);
            syllable = consonant + vowel;
        } else if (syllableType < 0.5) {
            // Consonant cluster + Vowel (bla, tre, etc.)
            const cluster = getRandomElement(pronounceableSyllables.consonantClusters);
            const vowel = getRandomElement(pronounceableSyllables.vowels);
            syllable = cluster + vowel;
        } else if (syllableType < 0.7) {
            // Vowel + Consonant (at, un, etc.)
            const vowel = getRandomElement(pronounceableSyllables.vowels);
            const consonant = getRandomElement(pronounceableSyllables.consonants);
            syllable = vowel + consonant;
        } else if (syllableType < 0.85) {
            // Prefix patterns
            syllable = getRandomElement(pronounceableSyllables.prefixes);
        } else {
            // Suffix patterns
            syllable = getRandomElement(pronounceableSyllables.suffixes);
        }
        
        // Tentukan panjang yang tersisa
        const remainingLength = length - currentLength;
        
        // Jika syllable terlalu panjang, potong
        if (syllable.length > remainingLength) {
            syllable = syllable.substring(0, remainingLength);
        }
        
        // Kapitalisasi acak jika uppercase diaktifkan
        if (includeUppercase && Math.random() < 0.3) {
            syllable = syllable.charAt(0).toUpperCase() + syllable.slice(1);
        }
        
        password += syllable;
        currentLength += syllable.length;
        
        // Tambahkan angka secara acak jika diaktifkan
        if (includeNumbers && Math.random() < 0.4 && currentLength < length) {
            const number = Math.floor(Math.random() * 10);
            password += number;
            currentLength++;
        }
        
        // Tambahkan simbol secara acak jika diaktifkan
        if (includeSymbols && Math.random() < 0.2 && currentLength < length) {
            const symbols = "!@#$%&*+=?";
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            password += symbol;
            currentLength++;
        }
    }
    
    // Pastikan panjang password sesuai
    if (password.length > length) {
        password = password.substring(0, length);
    }
    
    // Jika password terlalu pendek, tambahkan vokal
    while (password.length < length) {
        password += getRandomElement(pronounceableSyllables.vowels);
    }
    
    return password.substring(0, length);
}

// Helper function untuk mengambil elemen acak dari array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function updateStrength(password) 
{
    const length = password.length;
    let strength = "Weak";
    let strengthClass = "weak";
    let score = 0;

    // Check password length
    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    
    // Check character types
    if (/[A-Z]/.test(password)) score += 1; // Uppercase
    if (/[a-z]/.test(password)) score += 1; // Lowercase
    if (/[0-9]/.test(password)) score += 1; // Numbers
    if (/[!@#$%^&*()_+[\]{}|;:',.<>?/~`]/.test(password)) score += 1; // Symbols

    // Determine strength based on score
    if (score >= 5) {
        strength = "Strong";
        strengthClass = "strong";
    } else if (score >= 3) {
        strength = "Medium";
        strengthClass = "medium";
    } else {
        strength = "Weak";
        strengthClass = "weak";
    }

    strengthLabel.textContent = strength;
    
    // Remove existing classes
    strengthLabel.classList.remove('weak', 'medium', 'strong');
    strengthBar.classList.remove('weak', 'medium', 'strong');
    
    // Add new class based on strength
    strengthLabel.classList.add(strengthClass);
    strengthBar.classList.add(strengthClass);
    
    // Update strength bar width (handled by CSS classes now)
    if (strengthBar) {
        let barWidth = 25; // Default untuk weak
        if (strengthClass === "medium") barWidth = 60;
        if (strengthClass === "strong") barWidth = 100;
        strengthBar.style.width = `${barWidth}%`;
    }
}

// Generate password saat halaman dimuat
window.addEventListener("load", passwordMaker);

// event listener untuk tombol copy
copyButton.addEventListener("click", () => {
    if (!passwordInput.value) return;

    navigator.clipboard
    .writeText(passwordInput.value)
    .then(() =>  showCopyMessage())
    .catch((err) => console.error("Failed to copy: ", err));

});

function showCopyMessage() {
    // Simpan icon asli
    const originalIcon = copyButton.innerHTML;
    
    // Ubah ke icon check dengan warna hijau
    copyButton.innerHTML = '<i class="fas fa-check"></i>';
    copyButton.style.background = "#28a745";
    copyButton.style.color = "white";

    setTimeout(() => {
        // Kembalikan ke icon copy asli
        copyButton.innerHTML = originalIcon;
        copyButton.style.background = "";
        copyButton.style.color = "";
    }, 2000);
}

// History functionality
let passwordHistory = JSON.parse(localStorage.getItem('passwordHistory')) || [];

function addToHistory(password) {
    const timestamp = new Date().toLocaleString();
    const historyItem = {
        password: password,
        timestamp: timestamp,
        id: Date.now()
    };

    passwordHistory.unshift(historyItem);
    
    // Keep only last 10 passwords
    if (passwordHistory.length > 10) {
        passwordHistory = passwordHistory.slice(0, 10);
    }

    saveHistory();
    displayHistory();
}

function displayHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    if (passwordHistory.length === 0) {
        historyList.innerHTML = '<p class="no-history">No passwords generated yet</p>';
        return;
    }

    historyList.innerHTML = passwordHistory.map(item => `
        <div class="history-item">
            <span class="password-text">${item.password}</span>
            <button class="copy-history-btn" onclick="copyHistoryPassword('${item.password}')">
                <i class="fas fa-copy"></i>
            </button>
        </div>
    `).join('');
}

function copyHistoryPassword(password) {
    navigator.clipboard.writeText(password).then(() => {
        showNotification('Password copied from history!');
    }).catch(() => {
        alert('Failed to copy password!');
    });
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all password history?')) {
        passwordHistory = [];
        saveHistory();
        displayHistory();
    }
}

function toggleHistory() {
    const historyContainer = document.querySelector('.history-container');
    const toggleBtn = document.getElementById('toggle-history-btn');
    
    if (!historyContainer || !toggleBtn) return;
    
    // Cek visibility berdasarkan computed style atau default state
    const isHidden = historyContainer.style.display === 'none';
    
    if (isHidden) {
        // Jika tersembunyi, tampilkan
        historyContainer.style.display = 'block';
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-eye-slash';
        }
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide';
    } else {
        // Jika terlihat, sembunyikan
        historyContainer.style.display = 'none';
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-eye';
        }
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i> Show';
    }
}

function saveHistory() {
    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-green);
        color: black;
        padding: 10px 15px;
        border: 3px solid black;
        box-shadow: 4px 4px 0px black;
        z-index: 1000;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.9rem;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Initialize history functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    displayHistory();
    
    // Add event listeners for history controls
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const toggleHistoryBtn = document.getElementById('toggle-history-btn');
    
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearHistory);
    }
    
    if (toggleHistoryBtn) {
        toggleHistoryBtn.addEventListener('click', toggleHistory);
        // Set initial button state
        toggleHistoryBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide';
    }
    
    // Ensure history container is visible by default
    const historyContainer = document.querySelector('.history-container');
    if (historyContainer) {
        historyContainer.style.display = 'block';
    }
});

