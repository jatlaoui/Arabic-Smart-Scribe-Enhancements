import { useEffect, useCallback } from 'react';
import { useContentStore } from '@/store/contentStore';
import { useUIStore } from '@/store/uiStore';
import { apiClient } from '@/lib/api-client';
import { debounce } from 'lodash';

const AUTO_SAVE_DELAY = 3000; // 3 seconds

export const useAutoSave = () => {
  const {
    currentText,
    currentProject,
    autoSaveEnabled,
    hasUnsavedChanges,
    markSaved,
    setSaveInProgress,
    updateProject,
  } = useContentStore();
  
  const { addNotification } = useUIStore();

  const saveProject = useCallback(async () => {
    if (!currentProject || !hasUnsavedChanges || !autoSaveEnabled) {
      return;
    }

    try {
      setSaveInProgress(true);
      
      const response = await apiClient.projects.updateProject(currentProject.id, {
        content: currentText,
        word_count: currentText.split(/\s+/).filter(word => word.length > 0).length,
        updated_at: new Date().toISOString(),
      });

      if (response.success) {
        markSaved();
        updateProject({
          updatedAt: new Date().toISOString(),
          wordCount: currentText.split(/\s+/).filter(word => word.length > 0).length,
        });
        
        // Silent success - only show notification on first save or errors
        console.log('Auto-save successful');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      addNotification({
        type: 'warning',
        title: 'فشل الحفظ التلقائي',
        message: 'حدث خطأ أثناء الحفظ التلقائي. يرجى الحفظ يدوياً.',
        dismissible: true,
      });
    } finally {
      setSaveInProgress(false);
    }
  }, [
    currentText,
    currentProject,
    hasUnsavedChanges,
    autoSaveEnabled,
    markSaved,
    setSaveInProgress,
    updateProject,
    addNotification,
  ]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(saveProject, AUTO_SAVE_DELAY),
    [saveProject]
  );

  // Trigger auto-save when text changes
  useEffect(() => {
    if (hasUnsavedChanges && autoSaveEnabled && currentProject) {
      debouncedSave();
    }

    // Cleanup debounced function on unmount
    return () => {
      debouncedSave.cancel();
    };
  }, [hasUnsavedChanges, autoSaveEnabled, currentProject, debouncedSave]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && autoSaveEnabled) {
        e.preventDefault();
        e.returnValue = 'لديك تغييرات غير محفوظة. هل تريد المغادرة؟';
        
        // Attempt immediate save
        saveProject();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, autoSaveEnabled, saveProject]);

  // Manual save function
  const manualSave = useCallback(async () => {
    if (!currentProject) {
      addNotification({
        type: 'warning',
        title: 'لا يوجد مشروع',
        message: 'يجب إنشاء مشروع أولاً قبل الحفظ.',
        dismissible: true,
      });
      return;
    }

    try {
      setSaveInProgress(true);
      await saveProject();
      
      addNotification({
        type: 'success',
        title: 'تم الحفظ',
        message: 'تم حفظ المشروع بنجاح.',
        dismissible: true,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'فشل الحفظ',
        message: 'حدث خطأ أثناء حفظ المشروع.',
        dismissible: true,
      });
    }
  }, [currentProject, saveProject, addNotification, setSaveInProgress]);

  return {
    manualSave,
    autoSaveEnabled,
    hasUnsavedChanges,
    saveInProgress: useContentStore(state => state.saveInProgress),
  };
};