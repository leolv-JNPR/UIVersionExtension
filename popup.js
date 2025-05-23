// This script is executed when the popup is opened.
console.log("Popup script loaded.");

document.addEventListener('DOMContentLoaded', function() {
  const contentDiv = document.getElementById('content');

  // itemContainer is the div dedicated to this specific URL's content
  async function fetchDataAndDisplay(url, label, itemContainer) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for ${label}`);
      }
      const data = await response.json();
      const version = data.version;

      itemContainer.innerHTML = ''; // Clear "Loading..." text or previous content

      if (version) {
        const container = document.createElement('div');
        container.className = 'container';

        const versionInfoWrapper = document.createElement('div');
        versionInfoWrapper.className = 'version-info-wrapper';

        const labelText = document.createElement('span');
        labelText.className = 'version-label';
        labelText.textContent = label;
        versionInfoWrapper.appendChild(labelText);

        const versionNumberText = document.createElement('span');
        versionNumberText.className = 'version-number';
        versionNumberText.textContent = version;
        // Check for 'hotfix' and add class if present
        if (version.toLowerCase().includes('hotfix')) {
          versionNumberText.classList.add('hotfix-version');
        }
        versionInfoWrapper.appendChild(versionNumberText);

        container.appendChild(versionInfoWrapper);

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        container.appendChild(copyButton);

        // contentDiv.appendChild(container); NO - append to itemContainer
        itemContainer.appendChild(container);

        copyButton.addEventListener('click', () => {
          navigator.clipboard.writeText(version)
            .then(() => {
              console.log(`${label} version copied to clipboard`);
              copyButton.textContent = 'Copied!';
              setTimeout(() => { copyButton.textContent = 'Copy'; }, 2000);
            })
            .catch(err => {
              console.error(`Failed to copy ${label} version: `, err);
            });
        });
      } else {
        const errorText = document.createElement('p');
        errorText.className = 'error-text';
        errorText.textContent = `Version field not found in ${label} response.`;
        // contentDiv.appendChild(errorText); NO - append to itemContainer
        itemContainer.appendChild(errorText);
      }
    } catch (error) {
      itemContainer.innerHTML = ''; // Clear "Loading..." text or previous content
      console.error(`Error fetching or processing ${label} data:`, error);
      const errorText = document.createElement('p');
      errorText.className = 'error-text';
      errorText.textContent = `Error for ${label}: ${error.message}. See console.`;
      // contentDiv.appendChild(errorText); NO - append to itemContainer
      itemContainer.appendChild(errorText);
    }
  }

  // Use an async IIFE to manage the sequence of calls
  (async () => {
    const itemsToFetch = [
      { url: 'https://integration.mistsys.com/about.json', label: 'AWS Integration' },
      { url: 'https://manage-staging.mistsys.com/about.json', label: 'AWS Staging' },
      { url: 'https://integration.gc1.mistsys.com/about.json', label: 'GCP Integration' },
      { url: 'https://manage-staging.gc1.mistsys.com/about.json', label: 'GCP Staging' }
    ];

    for (const item of itemsToFetch) {
      // Create a container for this item's loading text and eventual content
      const itemSpecificContainer = document.createElement('div');
      // This container will respect the gap from #content

      const loadingMessage = document.createElement('p');
      loadingMessage.className = 'loading-text';
      loadingMessage.textContent = `Loading ${item.label}...`;
      itemSpecificContainer.appendChild(loadingMessage);
      contentDiv.appendChild(itemSpecificContainer);

      try {
        // Pass the container to be populated by the fetch function
        await fetchDataAndDisplay(item.url, item.label, itemSpecificContainer);
      } catch (sequenceError) {
        // This catch is for unexpected errors in awaiting fetchDataAndDisplay itself,
        // though fetchDataAndDisplay is designed to handle its own display errors.
        console.error(`Critical error in sequence for ${item.label}:`, sequenceError);
        itemSpecificContainer.innerHTML = ''; // Clear loading message
        const criticalErrorText = document.createElement('p');
        criticalErrorText.className = 'error-text';
        criticalErrorText.textContent = `Critical error for ${item.label}. Check console.`;
        itemSpecificContainer.appendChild(criticalErrorText);
      }
    }
  })();
});
