import React from 'react';
import { Box, Card, CardContent, Grid, Skeleton } from '@mui/material';

/**
 * LoadingSkeleton Component
 * Provides skeleton screens for different loading states
 */

// Skeleton for invitation cards in grid
export const InvitationCardSkeleton = ({ count = 6 }) => {
    return (
        <Grid container spacing={3}>
            {Array.from(new Array(count)).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Image skeleton */}
                        <Skeleton
                            variant="rectangular"
                            height={200}
                            animation="wave"
                        />

                        <CardContent>
                            {/* Title skeleton */}
                            <Skeleton
                                variant="text"
                                width="80%"
                                height={32}
                                sx={{ mb: 1 }}
                            />

                            {/* Description skeleton */}
                            <Skeleton
                                variant="text"
                                width="60%"
                                height={24}
                                sx={{ mb: 2 }}
                            />

                            {/* Button skeleton */}
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={36}
                                sx={{ borderRadius: 1 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

// Skeleton for canvas editor
export const CanvasEditorSkeleton = () => {
    return (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={3}>
                {/* Canvas area skeleton */}
                <Grid item xs={12} lg={8}>
                    <Skeleton
                        variant="rectangular"
                        height={600}
                        animation="wave"
                        sx={{ borderRadius: 2 }}
                    />
                </Grid>

                {/* Sidebar skeleton */}
                <Grid item xs={12} lg={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Skeleton
                            variant="rectangular"
                            height={200}
                            animation="wave"
                            sx={{ borderRadius: 2 }}
                        />
                        <Skeleton
                            variant="rectangular"
                            height={300}
                            animation="wave"
                            sx={{ borderRadius: 2 }}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

// Skeleton for invitation view
export const InvitationViewSkeleton = () => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
            }}
        >
            <Skeleton
                variant="rectangular"
                width={800}
                height={1123}
                animation="wave"
                sx={{
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                }}
            />
        </Box>
    );
};

// Generic content skeleton
export const ContentSkeleton = ({ lines = 3, width = '100%' }) => {
    return (
        <Box sx={{ width }}>
            {Array.from(new Array(lines)).map((_, index) => (
                <Skeleton
                    key={index}
                    variant="text"
                    width={index === lines - 1 ? '70%' : '100%'}
                    height={24}
                    sx={{ mb: 1 }}
                    animation="wave"
                />
            ))}
        </Box>
    );
};

export default {
    InvitationCardSkeleton,
    CanvasEditorSkeleton,
    InvitationViewSkeleton,
    ContentSkeleton,
};
