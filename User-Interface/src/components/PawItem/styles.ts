import { IStyle } from "@fluentui/merge-styles";
import { mergeStyleSets } from "@fluentui/react/lib/Styling";

const container: IStyle = {
        // display: 'grid',
        // backgroundColor: 'grey',
        width: '100%',
        borderColor: 'black'
    }
export const styles = {
    container
};
export const classNames = mergeStyleSets({
    container
})