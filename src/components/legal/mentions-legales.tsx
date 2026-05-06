"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MentionsLegales() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-4 flex items-center gap-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Mentions légales</h1>
        <p className="text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Éditeur du site</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <strong>Nom :</strong> Emilien GÂNE<br />
              <strong>Adresse :</strong> Cergy, France<br />
              <strong>Email :</strong> contact@egweb.fr<br />
              <strong>Directeur de publication :</strong> Emilien GÂNE
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hébergement</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Ce site est hébergé par Vercel Inc.<br />
              <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br />
              <strong>Site web :</strong> <a href="https://vercel.com" className="text-primary hover:underline">vercel.com</a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Propriété intellectuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              L&apos;ensemble de ce site relève de la législation française et internationale sur le droit d&apos;auteur et la propriété intellectuelle. 
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liens hypertextes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Les liens hypertextes mis en place dans le cadre du présent site web en direction d&apos;autres ressources présentes sur le réseau Internet 
              ne sauraient engager la responsabilité d&apos;asciitree.fr.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsabilité</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement remis à jour, 
              mais peut toutefois contenir des inexactitudes, des omissions ou des lacunes. 
              Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, 
              merci de bien vouloir le signaler par email à l&apos;adresse contact@asciitree.fr.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Droit applicable</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Tout litige en relation avec l&apos;utilisation du site asciitree.fr est soumis au droit français.
              Hormis les cas où la loi ne le permet pas, il est fait attribution exclusive de juridiction aux tribunaux compétents.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
