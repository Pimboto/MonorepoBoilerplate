'use client';

import { Card, Modal, Tooltip, toast } from '@heroui/react';
import { clsx } from 'clsx';
import { Calendar1, DocumentCopy, Eye, Folder, Trash } from 'iconsax-reactjs';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CustomButton } from '@/components/ui/CustomButton';
import type { Collection } from '@/features/collections/types';
import { DELETE_COLLECTION } from '@/lib/graphql/collections';
import { graphqlClient } from '@/lib/graphql-client';
import { EditCollectionModal } from './edit-collection-modal';

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 1. LOGICA DE IMAGENES (STACK)
  // Obtenemos hasta las 3 primeras imágenes para crear el efecto de pila real
  const stackImages = useMemo(() => {
    return (
      collection.files
        ?.filter(f => f.type?.startsWith('image/'))
        .slice(0, 3)
        .map(f => f.url) || []
    );
  }, [collection.files]);

  const mainImage = stackImages[0];
  const secondImage = stackImages[1];
  const thirdImage = stackImages[2];

  const fileCount = collection.files?.length || 0;

  const dateStr = new Date(collection.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await graphqlClient.request(DELETE_COLLECTION, { id: collection.id });
      toast.success('Collection removed');
      router.refresh();
    } catch {
      toast.danger('Could not remove collection');
    } finally {
      setDeleting(false);
    }
  };

  const handleNavigate = () => router.push(`/app/collections/${collection.id}`);

  return (
    <div
      className="group relative w-full aspect-square cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleNavigate} // Movemos el click aquí para evitar conflictos con Card props
    >
      {/* === CAPAS TRASERAS (STACK EFFECT) === */}

      {/* Capa 3 (La más profunda - Se asoma mucho por la izquierda/abajo) */}
      <div
        className={clsx(
          'absolute inset-0 rounded-2xl transition-all duration-500 ease-out overflow-hidden shadow-sm border border-white/10',
          // AQUI ESTA EL CAMBIO: rotate-6 (antes 3) y translate-x-4 para que salga por el lado
          isHovered
            ? 'translate-y-2 translate-x-3 rotate-6 scale-[0.92] opacity-100'
            : 'translate-y-0 translate-x-0 rotate-0 scale-100 opacity-0',
          !thirdImage && 'bg-default-200/50',
        )}
      >
        {thirdImage && (
          <img
            src={thirdImage}
            alt=""
            className="w-full h-full object-cover opacity-60 grayscale-[30%]"
          />
        )}
      </div>

      {/* Capa 2 (La del medio - Se asoma por la derecha/arriba inversa) */}
      <div
        className={clsx(
          'absolute inset-0 rounded-2xl transition-all duration-500 ease-out delay-75 overflow-hidden shadow-sm border border-white/10',
          // AQUI ESTA EL CAMBIO: -rotate-3 y translate-x negativo para cruzar el efecto
          isHovered
            ? '-translate-y-2 -translate-x-2 -rotate-3 scale-[0.96] opacity-100'
            : 'translate-y-0 rotate-0 scale-100 opacity-0',
          !secondImage && 'bg-default-300/40',
        )}
      >
        {secondImage && (
          <img src={secondImage} alt="" className="w-full h-full object-cover opacity-80" />
        )}
      </div>

      {/* === TARJETA PRINCIPAL (FRENTE) === */}
      {/* Quitamos isPressable del Card y usamos el div padre para la navegación */}
      <Card className="relative h-full w-full overflow-hidden rounded-2xl border-none shadow-medium group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out z-10 bg-background">
        {/* IMAGEN PRINCIPAL */}
        <div className="absolute inset-0 overflow-hidden">
          {mainImage ? (
            <>
              <img
                src={mainImage}
                alt={collection.name}
                className="w-full h-full object-cover transition-transform duration-[800ms] ease-in-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/80 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-primary/10 via-primary/10 to-primary/10 flex items-center justify-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
              <Folder size={56} variant="Bold" className="text-primary/50 relative z-10" />
            </div>
          )}
        </div>

        {/* OVERLAY DE CONTENIDO */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {/* HEADER CON TOOLTIPS CORREGIDOS */}
          <div
            className="flex justify-end gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-background/20 backdrop-blur-md rounded-full p-1 flex gap-1 border border-white/10 shadow-lg">
              {/* Edit Tooltip */}
              <Tooltip delay={0} closeDelay={0}>
                <Tooltip.Trigger>
                  <div className="hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                    <EditCollectionModal
                      collection={collection}
                      onSuccess={() => router.refresh()}
                    />
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content>Edit details</Tooltip.Content>
              </Tooltip>

              <div className="w-px bg-white/20 my-1" />

              {/* Delete Tooltip & Modal */}
              <Tooltip delay={0} closeDelay={0}>
                <Tooltip.Trigger>
                  <div className="hover:bg-danger/20 rounded-full transition-colors cursor-pointer">
                    {/* Usamos un div wrapper para el trigger del modal */}
                    <Modal>
                      <CustomButton
                        isIconOnly
                        size="sm"
                        variant="danger"
                        className="text-white hover:text-white data-[hover=true]:bg-transparent w-8 h-8 min-w-8"
                      >
                        <Trash size={16} />
                      </CustomButton>
                      <Modal.Backdrop>
                        <Modal.Container>
                          <Modal.Dialog>
                            {renderProps => (
                              <>
                                <Modal.CloseTrigger />
                                <Modal.Header>
                                  <Modal.Heading>Confirm Deletion</Modal.Heading>
                                </Modal.Header>
                                <Modal.Body>
                                  <p>
                                    Delete <strong>{collection.name}</strong> permanently?
                                  </p>
                                </Modal.Body>
                                <Modal.Footer>
                                  <CustomButton variant="ghost" onPress={() => renderProps.close()}>
                                    Cancel
                                  </CustomButton>
                                  <CustomButton
                                    variant="danger"
                                    onPress={async () => {
                                      await handleDelete();
                                      renderProps.close();
                                    }}
                                  >
                                    Delete
                                  </CustomButton>
                                </Modal.Footer>
                              </>
                            )}
                          </Modal.Dialog>
                        </Modal.Container>
                      </Modal.Backdrop>
                    </Modal>
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content>Delete collection</Tooltip.Content>
              </Tooltip>
            </div>
          </div>

          {/* CENTRO: Botón "Entrar" */}
          <div className="flex-1 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-400 ease-spring-bouncy">
              <Eye size={24} variant="Bold" />
            </div>
          </div>

          {/* FOOTER: Información */}
          <div className="relative z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h3
              className={clsx(
                'text-lg font-bold leading-tight truncate mb-1 transition-colors',
                mainImage ? 'text-white' : 'text-foreground',
              )}
            >
              {collection.name}
            </h3>

            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-md transition-colors',
                  mainImage
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-default-100 border-default-200 text-default-600',
                )}
              >
                <DocumentCopy size={12} variant="Bold" />
                <span>{fileCount} Items</span>
              </div>

              <div
                className={clsx(
                  'flex items-center gap-1.5 text-[11px] font-medium',
                  mainImage ? 'text-white/70' : 'text-muted-foreground',
                )}
              >
                <Calendar1 size={12} />
                <span>{dateStr}</span>
              </div>
            </div>

            {collection.description && (
              <p
                className={clsx(
                  'text-xs mt-2 line-clamp-1 transition-opacity duration-300',
                  mainImage ? 'text-white/60 group-hover:text-white/90' : 'text-muted-foreground',
                )}
              >
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
