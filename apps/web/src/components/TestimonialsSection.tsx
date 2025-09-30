"use client";

import { Box, Typography, Container, Paper, Avatar } from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";
import { Star } from "iconoir-react";

interface Testimonial {
  id: string;
  textKey: string;
  authorKey: string;
  roleKey: string;
  rating: number;
}

export function TestimonialsSection() {
  const { t } = useTranslation();

  const testimonials: Testimonial[] = [
    {
      id: "1",
      textKey: "testimonials.user1.text",
      authorKey: "testimonials.user1.author",
      roleKey: "testimonials.user1.role",
      rating: 5,
    },
    {
      id: "2",
      textKey: "testimonials.user2.text",
      authorKey: "testimonials.user2.author",
      roleKey: "testimonials.user2.role",
      rating: 5,
    },
    {
      id: "3",
      textKey: "testimonials.user3.text",
      authorKey: "testimonials.user3.author",
      roleKey: "testimonials.user3.role",
      rating: 5,
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        py: 8,
        minHeight: "60vh",
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: 24, md: 28 },
              fontWeight: 600,
              color: "rgba(0, 0, 0, 0.87)",
              borderLeft: "4px solid",
              borderColor: "#9333EA",
              pl: 2,
            }}
          >
            {t("testimonials.title")}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 4,
          }}
        >
          {testimonials.map((testimonial) => (
            <Paper
              key={testimonial.id}
              elevation={1}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "rgba(0, 0, 0, 0.08)",
                bgcolor: "#FFFFFF",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                },
              }}
            >
              {/* Header: Avatar + Stars */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#FFD700",
                    width: 56,
                    height: 56,
                    fontSize: 18,
                  }}
                >
                  {t(testimonial.authorKey).charAt(0)}
                </Avatar>
                
                {/* Rating Stars */}
                <Box sx={{ display: "flex", gap: 0.25 }}>
                  {[...Array(testimonial.rating)].map((_, index) => (
                    <Star
                      key={index}
                      width={18}
                      height={18}
                      fill="#FFB800"
                      stroke="#FFB800"
                      strokeWidth={1.5}
                    />
                  ))}
                </Box>
              </Box>

              {/* Author Name */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "rgba(0, 0, 0, 0.87)",
                  mb: 0.5,
                  fontSize: 18,
                }}
              >
                {t(testimonial.authorKey)}
              </Typography>

              {/* Testimonial Text */}
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(0, 0, 0, 0.6)",
                  lineHeight: 1.7,
                  fontSize: 14,
                }}
              >
                {t(testimonial.textKey)}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

