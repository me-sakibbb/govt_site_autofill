// Multi-pass autofill function (COMPLETE VERSION)
async function startAutofillMultiPass(profile) {
    setLoading(true);
    console.log('Starting multi-pass autofill with profile:', profile.name);

    try {
        let totalFilled = 0;
        let previousFieldCount = 0;
        let maxIterations = 10;
        let iteration = 0;

        while (iteration < maxIterations) {
            iteration++;
            console.log(`\n=== Pass ${iteration} ===`);

            const visibleFields = scrapeVisibleFields();
            const currentFieldCount = visibleFields.length;

            console.log(`Found ${currentFieldCount} visible fields`);

            if (iteration > 1 && currentFieldCount === previousFieldCount) {
                console.log('No new fields detected, stopping.');
                break;
            }

            previousFieldCount = currentFieldCount;

            if (visibleFields.length === 0) {
                if (iteration === 1) {
                    alert('No visible form fields found on this page.');
                }
                break;
            }

            const mapping = await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    action: 'MAP_FIELDS',
                    payload: {
                        formFields: visibleFields,
                        userData: profile.data
                    }
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Mapping error:', chrome.runtime.lastError.message);
                        resolve({});
                    } else if (response && response.success) {
                        resolve(response.mapping);
                    } else {
                        console.error('Mapping failed:', response?.error);
                        resolve({});
                    }
                });
            });

            console.log('Received mapping:', mapping);

            const filledThisRound = await applyMappingSingle(mapping, profile.profilePic);
            totalFilled += filledThisRound;

            console.log(`Filled ${filledThisRound} fields this pass, ${totalFilled} total`);

            if (filledThisRound === 0) {
                console.log('No fields filled this pass, stopping.');
                break;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        alert(`✅ Autofilled ${totalFilled} fields in ${iteration} pass${iteration > 1 ? 'es' : ''}!`);

    } catch (error) {
        console.error('Autofill Error:', error);
        alert('An error occurred: ' + error.message);
    } finally {
        setLoading(false);
    }
}
