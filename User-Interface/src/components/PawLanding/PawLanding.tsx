import React, { useEffect, useState } from 'react';
import { DefaultPalette, IStackStyles, Stack, } from '@fluentui/react';
import { PawActions } from '../PawActions';
import { PawService } from '../../services';
import { IPawItem } from '../../models';
import { PawItemList } from '../PawItemList/PawItemList';
import { Header } from '../Header/Header';

export const PawLanding = () => {
    const [paws, setPaws] = useState<IPawItem[]>([]);
    useEffect(() => {
        const getPaws = async () => {
            const pawsFromApi: IPawItem[] = await PawService.getPaws();
            setPaws(pawsFromApi);
        };
        getPaws();
    }, []);
    const stackStyles: IStackStyles = {
        root: {

        },
      };
      const leftNavStyles: IStackStyles = {
        root: {
          background: DefaultPalette.themeDark,
          color: DefaultPalette.white,
          minWidth: '300px',
          display: 'grid'
        },
      };
      const contentStyles: IStackStyles = {
        root: {
          color: DefaultPalette.white,
          width: '100%',
          minWidth: '900px',
          display: 'grid'
        },
      };
    return (
    <>
    <Stack><Header/></Stack>
    <Stack styles={stackStyles} horizontal>
        <Stack.Item styles={leftNavStyles}>
            <h1>Menu</h1>
        </Stack.Item>
        <Stack.Item>
            <Stack styles={contentStyles}>
                <Stack>
                    <PawActions />
                </Stack>
                <Stack styles={contentStyles}>
                    <PawItemList items={paws} />
                </Stack>
            </Stack>
        </Stack.Item>
    </Stack>
    </>
    );
};
