import { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogPositioner,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogBackdrop,
  Stack,
  Input,
  Group,
  createToaster,
  Text,
} from '@chakra-ui/react';
import type { ShareDialogProps } from '../types';

export function ShareDialog({ slides }: ShareDialogProps) {
  const toaster = createToaster({ placement: 'top-end', duration: 2000 });
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => slides.map((s) => s.id));
  const [canEdit, setCanEdit] = useState(false);
  
  const handleOpenChange = (e: { open: boolean }) => {
    setOpen(e.open);
    if (e.open) {
      // Reset selection to current slides when dialog opens
      setSelectedIds((prev) => (prev.length ? prev : slides.map((s) => s.id)));
      setCanEdit(false);
    }
  };

  const shareUrl = useMemo(() => {
    const base = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams(window.location.search);
    if (selectedIds.length > 0) {
      params.set('shared', selectedIds.join(','));
      params.set('edit', canEdit ? 'true' : 'false');
    } else {
      params.delete('shared');
      params.delete('edit');
    }
    return `${base}?${params.toString()}`;
  }, [selectedIds, canEdit]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toaster.success({ title: 'Share link copied' });
    } catch {
      toaster.error({ title: 'Failed to copy link' });
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button colorPalette="blue" variant="subtle" size="sm">Share</Button>
      </DialogTrigger>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>Select slides to share</DialogTitle>
          </DialogHeader>
          <DialogBody>
          {slides.length === 0 ? (
            <Text color="gray.600" fontSize="sm">No slides available to share.</Text>
          ) : (
            <>
              <Text fontSize="sm" fontWeight="semibold" mb={2}>Select slides:</Text>
              <Stack gap={2} maxH="260px" overflowY="auto" pr={1} mb={4}>
                {slides.map((slide, idx) => (
                  <Checkbox.Root
                    key={slide.id}
                    checked={selectedIds.includes(slide.id)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const isChecked = selectedIds.includes(slide.id);
                      setSelectedIds((prev) =>
                        isChecked ? prev.filter((id) => id !== slide.id) : [...prev, slide.id]
                      );
                    }}
                  >
                    <Checkbox.Control />
                    <Checkbox.Label>Slide {idx + 1}</Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </Stack>
              
              <Text fontSize="sm" fontWeight="semibold" mb={2}>Permissions:</Text>
              <Checkbox.Root
                checked={canEdit}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCanEdit(!canEdit);
                }}
              >
                <Checkbox.Control />
                <Checkbox.Label>
                  Allow editing (viewers can add and edit text boxes)
                </Checkbox.Label>
              </Checkbox.Root>
              <Text fontSize="xs" color="gray.600" ml={6} mt={1}>
                {canEdit 
                  ? '✓ Users can view and edit the selected slides' 
                  : 'ⓘ Users can only view the selected slides (read-only)'}
              </Text>
            </>
          )}
          <Stack gap={2} mt={4}>
            <Input readOnly value={shareUrl} />
            <Group>
              <Button colorPalette="blue" onClick={handleCopy}>Copy link</Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            </Group>
          </Stack>
          </DialogBody>
          <DialogFooter />
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}


