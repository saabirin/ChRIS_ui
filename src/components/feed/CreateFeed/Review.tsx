import React from 'react';

import { FolderCloseIcon, FileIcon, WarningTriangleIcon } from "@patternfly/react-icons";
import { Split, SplitItem, Grid, GridItem } from '@patternfly/react-core';

import { ChrisFile, CreateFeedData, DataFile } from "./CreateFeed";

interface ReviewProps {
  data: CreateFeedData
}

function generateFileList(files: DataFile[]) {
  return files.map(file => {
    let icon = (file as ChrisFile).children ? // file is a ChrisFile folder
      <FolderCloseIcon /> :
      <FileIcon />;
    return (
      <div className="file-preview" key={file.name}>
        {icon}
        <span className="file-name">{file.name}</span>
      </div>
    )
  })
}

const Review: React.FunctionComponent<ReviewProps> = (props: ReviewProps) => {  

    const { data } = props;

    // the installed version of @patternfly/react-core doesn't support read-only chips
    const tags = data.tags.map(tag => (
      <div className="pf-c-chip pf-m-read-only tag" key={ tag.data.id }>
        <span className="pf-c-chip__text">
          { tag.data.name }
        </span>
      </div>
    ))

    const showFileWarning = !(data.chrisFiles.length > 0 || data.localFiles.length > 0);

    return (
      <div className="review">
        <h1 className="pf-c-title pf-m-2xl">Review</h1>
        <p>Review the information below and click 'Finish' to create your new feed.</p>
        <p>Use the 'Back' button to make changes.</p>
        <br /><br />
        
        <Grid gutter="sm">
          <GridItem span={2}>Feed Name</GridItem>
          <GridItem span={10}>{ data.feedName }</GridItem>
          <GridItem span={2}>Feed Description</GridItem>
          <GridItem span={10}>{ data.feedDescription }</GridItem>
          <GridItem span={2}>Tags</GridItem>
          <GridItem span={10}>{ tags }</GridItem>
        </Grid>

        <br />
        <Split>
          <SplitItem isMain className="file-list">
            <p>ChRIS files to add to new feed:</p>
            { generateFileList(data.chrisFiles) }
          </SplitItem>
          <SplitItem isMain className="file-list">
            <p>Local files to add to new feed:</p>
            { generateFileList(data.localFiles) }
          </SplitItem>
        </Split>

        <br />
        { showFileWarning && 
          (
            <div className="file-warning">
              <WarningTriangleIcon />
              Please select at least one file.
            </div>
          )
        }

      </div>
    )
}

export default Review;