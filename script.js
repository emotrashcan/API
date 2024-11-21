$(document).ready(function() {
    const API_URL = 'https://usmanlive.com/wp-json/api/stories/';
    
    // Load stories when page loads
    loadStories();

    // Add validation functions
    function validateTitle(title) {
        if (!title) return "Title is required";
        if (title.length < 3) return "Title must be at least 3 characters long";
        if (title.length > 100) return "Title must not exceed 100 characters";
        return null;
    }

    function validateContent(content) {
        if (!content) return "Content is required";
        if (content.length < 10) return "Content must be at least 10 characters long";
        if (content.length > 1000) return "Content must not exceed 1000 characters";
        return null;
    }

    // Handle form submission
    $('#storyForm').on('submit', function(e) {
        e.preventDefault();
        
        const title = $('#title').val().trim();
        const content = $('#content').val().trim();
        
        // Clear previous error states
        $('.form-control').removeClass('is-invalid');
        $('.invalid-feedback').remove();
        
        // Validate inputs
        const titleError = validateTitle(title);
        if (titleError) {
            $('#title').addClass('is-invalid');
            $('#title').after(`<div class="invalid-feedback">${titleError}</div>`);
            return;
        }
        
        const contentError = validateContent(content);
        if (contentError) {
            $('#content').addClass('is-invalid');
            $('#content').after(`<div class="invalid-feedback">${contentError}</div>`);
            return;
        }

        const storyId = $('#storyId').val();
        const storyData = { title, content };

        // Show loading state
        const submitBtn = $('#submitBtn');
        const originalBtnText = submitBtn.html();
        submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Processing...');
        submitBtn.prop('disabled', true);

        if (storyId) {
            updateStory(storyId, storyData, submitBtn, originalBtnText);
        } else {
            createStory(storyData, submitBtn, originalBtnText);
        }
    });

    // Load all stories
    function loadStories() {
        showLoading(true);
        $.ajax({
            url: API_URL,
            method: 'GET',
            success: function(stories) {
                displayStories(stories);
                showLoading(false);
            },
            error: function(xhr, status, error) {
                showToast('error', 'Error loading stories: ' + error);
                showLoading(false);
            }
        });
    }

    // Create new story
    function createStory(storyData, submitBtn, originalBtnText) {
        $.ajax({
            url: API_URL,
            method: 'POST',
            data: storyData,
            success: function(response) {
                resetForm();
                loadStories();
                showToast('success', 'Story created successfully!');
            },
            error: function(xhr, status, error) {
                showToast('error', 'Error creating story: ' + error);
            },
            complete: function() {
                submitBtn.html(originalBtnText);
                submitBtn.prop('disabled', false);
            }
        });
    }

    // Update existing story
    function updateStory(id, storyData, submitBtn, originalBtnText) {
        $.ajax({
            url: `${API_URL}${id}`,
            method: 'PUT',
            data: storyData,
            success: function(response) {
                resetForm();
                loadStories();
                showToast('success', 'Story updated successfully!');
            },
            error: function(xhr, status, error) {
                showToast('error', 'Error updating story: ' + error);
            },
            complete: function() {
                submitBtn.html(originalBtnText);
                submitBtn.prop('disabled', false);
            }
        });
    }

    // Delete story
    function deleteStory(id) {
        if (confirm('Are you sure you want to delete this story?')) {
            $.ajax({
                url: `${API_URL}${id}`,
                method: 'DELETE',
                success: function(response) {
                    loadStories();
                    showToast('success', 'Story deleted successfully!');
                },
                error: function(xhr, status, error) {
                    showToast('error', 'Error deleting story: ' + error);
                }
            });
        }
    }

    // Display stories in cards
    function displayStories(stories) {
        const storiesList = $('#storiesList');
        storiesList.empty();

        stories.forEach(story => {
            if (story.title && story.content) {
                const storyCard = `
                    <div class="col-md-6 mb-4">
                        <div class="card story-card">
                            <div class="card-body">
                                <h5 class="card-title">
                                    <i class="fas fa-book-open text-accent me-2"></i>
                                    ${story.title}
                                </h5>
                                <p class="card-text story-content">${story.content}</p>
                                <div class="story-actions">
                                    <button class="btn btn-edit" 
                                            onclick="editStory('${story.id}', '${story.title}', '${story.content}')">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="btn btn-delete" 
                                            onclick="deleteStory('${story.id}')">
                                        <i class="fas fa-trash-alt"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                storiesList.append(storyCard);
            }
        });
    }

    // Reset form
    function resetForm() {
        $('#storyId').val('');
        $('#title').val('');
        $('#content').val('');
        $('#submitBtn').html('<i class="fas fa-paper-plane"></i> Add Story');
        $('#cancelBtn').hide();
    }

    // Edit story (populate form)
    window.editStory = function(id, title, content) {
        $('#storyId').val(id);
        $('#title').val(title);
        $('#content').val(content);
        $('#submitBtn').html('<i class="fas fa-save"></i> Update Story');
        $('#cancelBtn').show();
        $('html, body').animate({ scrollTop: 0 }, 'slow');
    };

    // Delete story (global function)
    window.deleteStory = deleteStory;

    // Cancel button handler
    $('#cancelBtn').on('click', function() {
        resetForm();
    });

    function showLoading(show) {
        if (show) {
            $('body').addClass('loading');
        } else {
            $('body').removeClass('loading');
        }
    }

    // Toast notification system
    function showToast(type, message) {
        const toast = `
            <div class="toast-notification ${type}">
                <i class="fas ${getToastIcon(type)}"></i>
                ${message}
            </div>
        `;
        
        $('body').append(toast);
        const $toast = $('.toast-notification').last();
        
        setTimeout(() => {
            $toast.addClass('show');
            setTimeout(() => {
                $toast.removeClass('show');
                setTimeout(() => $toast.remove(), 300);
            }, 3000);
        }, 100);
    }

    function getToastIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'info': return 'fa-info-circle';
            default: return 'fa-info-circle';
        }
    }
}); 